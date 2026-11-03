import "server-only";
import type { User } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signToken,
  verifyToken,
} from "./jwt";
import { ApiError } from "@/lib/http";

export type CurrentUser = Pick<
  User,
  "id" | "email" | "name" | "username" | "role"
>;

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function startSession(user: { id: string; role: "CUSTOMER" | "ADMIN" }) {
  const jar = await cookies();
  if (user.role === "ADMIN") {
    jar.set(ADMIN_COOKIE, await signToken({ sub: user.id, role: "ADMIN" }, ADMIN_MAX_AGE), {
      ...baseCookie,
      maxAge: ADMIN_MAX_AGE,
    });
  } else {
    jar.set(SESSION_COOKIE, await signToken({ sub: user.id, role: "CUSTOMER" }, SESSION_MAX_AGE), {
      ...baseCookie,
      maxAge: SESSION_MAX_AGE,
    });
  }
}

export async function endSession(which: "customer" | "admin") {
  const jar = await cookies();
  jar.delete(which === "admin" ? ADMIN_COOKIE : SESSION_COOKIE);
}

async function userFromCookie(
  name: string,
  role: "CUSTOMER" | "ADMIN",
): Promise<CurrentUser | null> {
  const jar = await cookies();
  const payload = await verifyToken(jar.get(name)?.value);
  if (!payload || payload.role !== role) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, username: true, role: true },
  });
  return user && user.role === role ? user : null;
}

export const getCurrentUser: () => Promise<CurrentUser | null> = cache(() =>
  userFromCookie(SESSION_COOKIE, "CUSTOMER"),
);
export const getCurrentAdmin: () => Promise<CurrentUser | null> = cache(() =>
  userFromCookie(ADMIN_COOKIE, "ADMIN"),
);

/** For API routes: throws 401. */
export async function requireUserApi() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Authentication required");
  return user;
}

export async function requireAdminApi() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new ApiError(401, "Admin authentication required");
  return admin;
}

/** For pages: redirects to login. */
export async function requireUserPage(next: string) {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
