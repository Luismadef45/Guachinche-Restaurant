import { prisma } from "./prisma";
import { addDays, generateToken, hashToken } from "./security";

export const SESSION_COOKIE = "grst_session";

const DEFAULT_TTL_DAYS = 30;

export function getSessionTtlDays() {
  const raw = Number(process.env.AUTH_SESSION_TTL_DAYS ?? DEFAULT_TTL_DAYS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TTL_DAYS;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionTtlDays() * 24 * 60 * 60
  };
}

export async function createSession(params: {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = addDays(new Date(), getSessionTtlDays());

  const session = await prisma.session.create({
    data: {
      userId: params.userId,
      tokenHash,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      expiresAt
    }
  });

  return { token, expiresAt, sessionId: session.id };
}

export async function revokeSessionByTokenHash(tokenHash: string) {
  return prisma.session.updateMany({
    where: {
      tokenHash,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}

export async function revokeSessionsForUser(userId: string) {
  return prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}
