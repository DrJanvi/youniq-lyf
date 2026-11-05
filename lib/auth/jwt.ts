import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";
export const ADMIN_COOKIE = "admin_token";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
export const ADMIN_MAX_AGE = 60 * 60 * 8;

export type TokenPayload = {
  sub: string;
  role: "CUSTOMER" | "ADMIN";
  sessionVersion: number;
};

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET must be set (16+ chars)");
  return new TextEncoder().encode(s);
}

export async function signToken(payload: TokenPayload, maxAgeSeconds: number) {
  return new SignJWT({
    role: payload.role,
    sessionVersion: payload.sessionVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secret());
}

export async function verifyToken(token: string | undefined): Promise<TokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    const role = payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
    const sessionVersion =
      typeof payload.sessionVersion === "number" &&
      Number.isSafeInteger(payload.sessionVersion) &&
      payload.sessionVersion >= 0
        ? payload.sessionVersion
        : 0;
    return { sub: payload.sub, role, sessionVersion };
  } catch {
    return null;
  }
}
