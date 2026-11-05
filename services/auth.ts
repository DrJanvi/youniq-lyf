import { getAccountRecoveryDeadline } from "@/lib/auth/account-deletion";
import { ApiError } from "@/lib/http";
import { getMailer } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import "server-only";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

const hashCode = (email: string, code: string) =>
  createHmac("sha256", process.env.JWT_SECRET ?? "")
    .update(`${email}:${code}`)
    .digest("hex");

async function sendCode(email: string) {
  const now = Date.now();
  const recent = await prisma.loginCode.findMany({
    where: { email, createdAt: { gte: new Date(now - 60 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new ApiError(
      429,
      "Please wait a minute before requesting another code",
    );
  }
  if (recent.length >= MAX_PER_HOUR)
    throw new ApiError(429, "Too many requests, try again later");

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const loginCode = await prisma.loginCode.create({
    data: {
      email,
      codeHash: hashCode(email, code),
      expiresAt: new Date(now + CODE_TTL_MS),
    },
  });
  try {
    await getMailer().send(
      email,
      "Your Youniqlyf confirmation code",
      `Your code is ${code}. It expires in 10 minutes.`,
    );
    if (process.env.NODE_ENV === "development") {
      console.info(`[dev] Registration confirmation code: ${code}`);
    }
  } catch (error) {
    await prisma.loginCode.delete({ where: { id: loginCode.id } });
    throw error;
  }
}

async function consumeCode(email: string, code: string) {
  const row = await prisma.loginCode.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.attempts >= MAX_ATTEMPTS)
    throw new ApiError(400, "Invalid or expired code");

  const a = Buffer.from(row.codeHash);
  const b = Buffer.from(hashCode(email, code));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await prisma.loginCode.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
    });
    throw new ApiError(400, "Invalid or expired code");
  }
  // Atomic claim guards against concurrent reuse of the same code.
  const claimed = await prisma.loginCode.updateMany({
    where: { id: row.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count === 0) throw new ApiError(400, "Invalid or expired code");
}

const EMAIL_TAKEN =
  "An account with this email already exists. Please sign in.";

export async function requestRegistrationCode(email: string) {
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } }))
    throw new ApiError(409, EMAIL_TAKEN);
  await sendCode(email);
}

export async function registerCustomer(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  dateOfBirth: string;
  password: string;
  code: string;
}) {
  const {
    firstName,
    lastName,
    email,
    phone,
    gender,
    dateOfBirth,
    password,
    code,
  } = input;
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } }))
    throw new ApiError(409, EMAIL_TAKEN);
  await consumeCode(email, code);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        phone,
        gender,
        dateOfBirth: new Date(`${dateOfBirth}T00:00:00.000Z`),
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    return {
      id: user.id,
      email: user.email,
      role: "CUSTOMER" as const,
      sessionVersion: user.sessionVersion,
    };
  } catch {
    throw new ApiError(409, EMAIL_TAKEN);
  }
}

export async function verifyCustomerLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || user.role !== "CUSTOMER" || !user.passwordHash || !ok) {
    throw new ApiError(401, "Invalid email or password");
  }

  let sessionVersion = user.sessionVersion;
  let recovered = false;
  if (user.accountDeletionRequestedAt) {
    const recoveryDeadline = getAccountRecoveryDeadline(
      user.accountDeletionRequestedAt,
    );
    if (Date.now() >= recoveryDeadline.getTime()) {
      throw new ApiError(
        403,
        "The 30-day recovery period has ended. This account can no longer be restored.",
      );
    }

    const restored = await prisma.user.updateMany({
      where: {
        id: user.id,
        role: "CUSTOMER",
        accountDeletionRequestedAt: user.accountDeletionRequestedAt,
        sessionVersion: user.sessionVersion,
      },
      data: {
        accountDeletionRequestedAt: null,
        sessionVersion: { increment: 1 },
      },
    });
    if (!restored.count) {
      throw new ApiError(
        409,
        "The account status changed during sign-in. Please try again.",
      );
    }
    sessionVersion += 1;
    recovered = true;
  }

  return {
    id: user.id,
    email: user.email,
    role: "CUSTOMER" as const,
    sessionVersion,
    recovered,
  };
}

export async function scheduleCustomerDeletion(
  userId: string,
  currentPassword: string,
) {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "CUSTOMER" },
    select: {
      passwordHash: true,
      accountDeletionRequestedAt: true,
      sessionVersion: true,
    },
  });
  if (!user) throw new ApiError(404, "Customer account not found");
  if (user.accountDeletionRequestedAt) {
    throw new ApiError(409, "Account deletion is already scheduled.");
  }
  if (!user.passwordHash) {
    throw new ApiError(
      400,
      "Account deletion is unavailable because this account has no password set.",
    );
  }
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  const requestedAt = new Date();
  const scheduled = await prisma.user.updateMany({
    where: {
      id: userId,
      role: "CUSTOMER",
      passwordHash: user.passwordHash,
      accountDeletionRequestedAt: null,
      sessionVersion: user.sessionVersion,
    },
    data: {
      accountDeletionRequestedAt: requestedAt,
      sessionVersion: { increment: 1 },
    },
  });
  if (!scheduled.count) {
    throw new ApiError(
      409,
      "The account changed during this request. Please try again.",
    );
  }

  return {
    recoveryDeadline: getAccountRecoveryDeadline(requestedAt).toISOString(),
  };
}

export async function changeCustomerPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "CUSTOMER" },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    throw new ApiError(
      400,
      "Password change is unavailable because this account has no password set.",
    );
  }

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new ApiError(400, "Current password is incorrect.");
  }
  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    throw new ApiError(
      400,
      "Choose a new password different from your current one.",
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const updated = await prisma.user.updateMany({
    where: { id: userId, role: "CUSTOMER", passwordHash: user.passwordHash },
    data: { passwordHash },
  });
  if (!updated.count) {
    throw new ApiError(
      409,
      "The password changed during this request. Please try again.",
    );
  }

  return { updated: true };
}

// Pre-computed hash so unknown usernames cost the same as wrong passwords.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

export async function verifyAdminLogin(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || user.role !== "ADMIN" || !ok)
    throw new ApiError(401, "Invalid user id or password");
  return { id: user.id, role: "ADMIN" as const };
}
