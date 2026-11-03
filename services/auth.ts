import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";
import { getMailer } from "@/lib/mail";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

const hashCode = (email: string, code: string) =>
  createHmac("sha256", process.env.JWT_SECRET ?? "").update(`${email}:${code}`).digest("hex");

async function sendCode(email: string) {
  const now = Date.now();
  const recent = await prisma.loginCode.findMany({
    where: { email, createdAt: { gte: new Date(now - 60 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new ApiError(429, "Please wait a minute before requesting another code");
  }
  if (recent.length >= MAX_PER_HOUR) throw new ApiError(429, "Too many requests, try again later");

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const loginCode = await prisma.loginCode.create({
    data: { email, codeHash: hashCode(email, code), expiresAt: new Date(now + CODE_TTL_MS) },
  });
  try {
    await getMailer().send(email, "Your Banafa confirmation code", `Your code is ${code}. It expires in 10 minutes.`);
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
  if (!row || row.attempts >= MAX_ATTEMPTS) throw new ApiError(400, "Invalid or expired code");

  const a = Buffer.from(row.codeHash);
  const b = Buffer.from(hashCode(email, code));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await prisma.loginCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    throw new ApiError(400, "Invalid or expired code");
  }
  // Atomic claim guards against concurrent reuse of the same code.
  const claimed = await prisma.loginCode.updateMany({
    where: { id: row.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count === 0) throw new ApiError(400, "Invalid or expired code");
}

const EMAIL_TAKEN = "An account with this email already exists. Please sign in.";

export async function requestRegistrationCode(email: string) {
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) throw new ApiError(409, EMAIL_TAKEN);
  await sendCode(email);
}

export async function registerCustomer(input: { firstName: string; lastName: string; email: string; password: string; code: string }) {
  const { firstName, lastName, email, password, code } = input;
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) throw new ApiError(409, EMAIL_TAKEN);
  await consumeCode(email, code);
  try {
    const user = await prisma.user.create({
      data: { email, name: `${firstName} ${lastName}`, passwordHash: await bcrypt.hash(password, 10) },
    });
    return { id: user.id, email: user.email, role: "CUSTOMER" as const };
  } catch {
    throw new ApiError(409, EMAIL_TAKEN);
  }
}

export async function verifyCustomerLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || user.role !== "CUSTOMER" || !ok) throw new ApiError(401, "Invalid email or password");
  return { id: user.id, email: user.email, role: "CUSTOMER" as const };
}

// Pre-computed hash so unknown usernames cost the same as wrong passwords.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

export async function verifyAdminLogin(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || user.role !== "ADMIN" || !ok) throw new ApiError(401, "Invalid user id or password");
  return { id: user.id, role: "ADMIN" as const };
}
