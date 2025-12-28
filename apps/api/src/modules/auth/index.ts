import type { FastifyInstance } from "fastify";
import speakeasy from "speakeasy";
import { APP_NAME } from "@guachince/shared";
import { prisma } from "../../lib/prisma";
import { logAudit } from "../../lib/audit";
import {
  addMinutes,
  generateToken,
  hashPassword,
  hashToken,
  verifyPassword
} from "../../lib/security";
import {
  createSession,
  getSessionCookieOptions,
  revokeSessionByTokenHash,
  revokeSessionsForUser,
  SESSION_COOKIE
} from "../../lib/session";
import { MFA_REQUIRED_ROLES } from "../../lib/permissions";

const PASSWORD_MIN_LENGTH = 8;
const DEFAULT_RESET_TTL_MINUTES = 30;
const DEFAULT_MFA_TTL_MINUTES = 15;

const roleIncludes = {
  roles: {
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true }
          }
        }
      }
    }
  }
};

const buildUserPayload = (user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  mfaEnabled: boolean;
  roles: Array<{ role: { name: string; permissions: Array<{ permission: { key: string } }> } }>;
}) => {
  const roles = user.roles.map((userRole) => userRole.role.name);
  const permissions = Array.from(
    new Set(
      user.roles.flatMap((userRole) => userRole.role.permissions.map((perm) => perm.permission.key))
    )
  );

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    roles,
    permissions,
    mfaEnabled: user.mfaEnabled
  };
};

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isMfaRequired = (roles: string[], mfaEnabled: boolean) => {
  const hasRequiredRole = roles.some((role) => MFA_REQUIRED_ROLES.includes(role));
  return {
    hasRequiredRole,
    requiresMfa: mfaEnabled || hasRequiredRole
  };
};

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post(
    "/api/auth/register",
    {
      schema: {
        description: "Register a new customer account",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: { type: "string", minLength: 1 },
            lastName: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            password: { type: "string", minLength: PASSWORD_MIN_LENGTH }
          }
        },
        response: {
          201: {
            type: "object",
            properties: {
              user: { type: "object" }
            }
          },
          409: {
            type: "object",
            properties: { error: { type: "string" } }
          }
        }
      }
    },
    async (request, reply) => {
      const { firstName, lastName, email, phone, password } = request.body as {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
      };

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.code(409).send({
          error: "A user with this email already exists."
        });
      }

      const customerRole = await prisma.role.findUnique({
        where: { name: "Customer" }
      });

      if (!customerRole) {
        return reply.code(500).send({
          error: "Customer role is missing. Seed the database first."
        });
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone: phone || null,
          passwordHash,
          roles: {
            create: {
              roleId: customerRole.id
            }
          }
        },
        include: roleIncludes
      });

      const session = await createSession({
        userId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]
      });

      reply.setCookie(SESSION_COOKIE, session.token, getSessionCookieOptions());

      await logAudit({
        action: "auth.register",
        actorId: user.id,
        targetType: "User",
        targetId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]
      });

      return reply.code(201).send({
        user: buildUserPayload(user)
      });
    }
  );

  app.post(
    "/api/auth/login",
    {
      schema: {
        description: "Login with email and password",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
            mfaCode: { type: "string" }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: { type: "object" }
            }
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
              mfaRequired: { type: "boolean" }
            }
          },
          428: {
            type: "object",
            properties: {
              error: { type: "string" },
              mfaSetupRequired: { type: "boolean" }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const { email, password, mfaCode } = request.body as {
        email: string;
        password: string;
        mfaCode?: string;
      };

      const user = await prisma.user.findUnique({
        where: { email },
        include: roleIncludes
      });

      if (!user || !user.passwordHash) {
        await logAudit({
          action: "auth.login_failed",
          targetType: "User",
          targetId: user?.id ?? null,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
          metadata: { reason: "user_not_found" }
        });
        return reply.code(401).send({
          error: "Invalid email or password."
        });
      }

      if (!user.isActive) {
        return reply.code(401).send({
          error: "Account is inactive. Please contact support."
        });
      }

      const passwordValid = await verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        await logAudit({
          action: "auth.login_failed",
          targetType: "User",
          targetId: user.id,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
          metadata: { reason: "invalid_password" }
        });
        return reply.code(401).send({
          error: "Invalid email or password."
        });
      }

      const userPayload = buildUserPayload(user);
      const mfaStatus = isMfaRequired(userPayload.roles, userPayload.mfaEnabled);

      if (mfaStatus.hasRequiredRole && !userPayload.mfaEnabled) {
        return reply.code(428).send({
          error: "MFA setup required for this role.",
          mfaSetupRequired: true
        });
      }

      if (mfaStatus.requiresMfa) {
        if (!mfaCode) {
          return reply.code(401).send({
            error: "MFA code required.",
            mfaRequired: true
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.mfaSecret ?? "",
          encoding: "base32",
          token: mfaCode,
          window: 1
        });

        if (!verified) {
          await logAudit({
            action: "auth.login_failed",
            targetType: "User",
            targetId: user.id,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"],
            metadata: { reason: "mfa_failed" }
          });
          return reply.code(401).send({
            error: "Invalid MFA code."
          });
        }
      }

      const session = await createSession({
        userId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]
      });

      reply.setCookie(SESSION_COOKIE, session.token, getSessionCookieOptions());

      await logAudit({
        action: "auth.login",
        actorId: user.id,
        targetType: "User",
        targetId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]
      });

      return reply.send({ user: userPayload });
    }
  );

  app.post(
    "/api/auth/logout",
    {
      schema: {
        description: "Logout and revoke the current session",
        tags: ["auth"],
        response: {
          200: {
            type: "object",
            properties: { success: { type: "boolean" } }
          }
        }
      },
      preHandler: (request, reply) => app.requireAuth(request, reply)
    },
    async (request, reply) => {
      const token = request.cookies?.[SESSION_COOKIE];
      if (token) {
        await revokeSessionByTokenHash(hashToken(token));
      }
      reply.clearCookie(SESSION_COOKIE, getSessionCookieOptions());

      await logAudit({
        action: "auth.logout",
        actorId: request.user?.id,
        targetType: "User",
        targetId: request.user?.id ?? null,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]
      });

      return reply.send({ success: true });
    }
  );

  app.get(
    "/api/auth/me",
    {
      schema: {
        description: "Get the current authenticated user",
        tags: ["auth"],
        response: {
          200: { type: "object", properties: { user: { type: "object" } } }
        }
      },
      preHandler: (request, reply) => app.requireAuth(request, reply)
    },
    async (request, reply) => {
      return reply.send({ user: request.user });
    }
  );

  app.post(
    "/api/auth/password-reset/request",
    {
      schema: {
        description: "Request a password reset token",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              resetToken: { type: "string" },
              expiresAt: { type: "string", format: "date-time" }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const { email } = request.body as { email: string };
      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        const token = generateToken();
        const tokenHashValue = hashToken(token);
        const ttlMinutes = parsePositiveNumber(
          process.env.AUTH_PASSWORD_RESET_TTL_MINUTES,
          DEFAULT_RESET_TTL_MINUTES
        );
        const expiresAt = addMinutes(new Date(), ttlMinutes);

        await prisma.passwordResetToken.deleteMany({
          where: {
            userId: user.id,
            usedAt: null
          }
        });

        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: tokenHashValue,
            expiresAt
          }
        });

        await logAudit({
          action: "auth.password_reset_requested",
          actorId: user.id,
          targetType: "User",
          targetId: user.id,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"]
        });

        return reply.send({
          success: true,
          resetToken: process.env.NODE_ENV === "production" ? undefined : token,
          expiresAt
        });
      }

      return reply.send({ success: true });
    }
  );

  app.post(
    "/api/auth/password-reset/confirm",
    {
      schema: {
        description: "Confirm a password reset token",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["token", "password"],
          properties: {
            token: { type: "string" },
            password: { type: "string", minLength: PASSWORD_MIN_LENGTH }
          }
        },
        response: {
          200: { type: "object", properties: { success: { type: "boolean" } } },
          400: { type: "object", properties: { error: { type: "string" } } }
        }
      }
    },
    async (request, reply) => {
      const { token, password } = request.body as {
        token: string;
        password: string;
      };

      const tokenHashValue = hashToken(token);
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          tokenHash: tokenHashValue,
          usedAt: null,
          expiresAt: { gt: new Date() }
        }
      });

      if (!resetToken) {
        return reply.code(400).send({ error: "Invalid or expired token." });
      }

      const passwordHash = await hashPassword(password);

      await prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          passwordUpdatedAt: new Date()
        }
      });

      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      });

      await revokeSessionsForUser(resetToken.userId);

      await logAudit({
        action: "auth.password_reset_confirmed",
        actorId: resetToken.userId,
        targetType: "User",
        targetId: resetToken.userId,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]
      });

      return reply.send({ success: true });
    }
  );

  app.post(
    "/api/auth/mfa/enroll",
    {
      schema: {
        description: "Enroll a user in MFA",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              enrollmentToken: { type: "string" },
              secret: { type: "string" },
              otpauthUrl: { type: "string" },
              expiresAt: { type: "string", format: "date-time" }
            }
          },
          409: { type: "object", properties: { error: { type: "string" } } }
        }
      }
    },
    async (request, reply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const user = await prisma.user.findUnique({
        where: { email },
        include: roleIncludes
      });

      if (!user || !user.passwordHash) {
        return reply.code(401).send({ error: "Invalid credentials." });
      }

      const passwordValid = await verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        return reply.code(401).send({ error: "Invalid credentials." });
      }

      if (user.mfaEnabled) {
        return reply.code(409).send({ error: "MFA is already enabled." });
      }

      await prisma.mfaEnrollment.deleteMany({ where: { userId: user.id } });

      const secret = speakeasy.generateSecret({
        name: `${APP_NAME} (${user.email})`
      });
      const enrollmentToken = generateToken();
      const tokenHashValue = hashToken(enrollmentToken);
      const ttlMinutes = parsePositiveNumber(
        process.env.AUTH_MFA_ENROLL_TTL_MINUTES,
        DEFAULT_MFA_TTL_MINUTES
      );
      const expiresAt = addMinutes(new Date(), ttlMinutes);

      await prisma.mfaEnrollment.create({
        data: {
          userId: user.id,
          secret: secret.base32,
          tokenHash: tokenHashValue,
          expiresAt
        }
      });

      await logAudit({
        action: "auth.mfa_enroll_started",
        actorId: user.id,
        targetType: "User",
        targetId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]
      });

      return reply.send({
        enrollmentToken,
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
        expiresAt
      });
    }
  );

  app.post(
    "/api/auth/mfa/confirm",
    {
      schema: {
        description: "Confirm MFA enrollment with a code",
        tags: ["auth"],
        body: {
          type: "object",
          required: ["enrollmentToken", "code"],
          properties: {
            enrollmentToken: { type: "string" },
            code: { type: "string" }
          }
        },
        response: {
          200: { type: "object", properties: { success: { type: "boolean" } } },
          400: { type: "object", properties: { error: { type: "string" } } }
        }
      }
    },
    async (request, reply) => {
      const { enrollmentToken, code } = request.body as {
        enrollmentToken: string;
        code: string;
      };

      const tokenHashValue = hashToken(enrollmentToken);
      const enrollment = await prisma.mfaEnrollment.findFirst({
        where: {
          tokenHash: tokenHashValue,
          expiresAt: { gt: new Date() }
        }
      });

      if (!enrollment) {
        return reply.code(400).send({ error: "Invalid or expired enrollment token." });
      }

      const verified = speakeasy.totp.verify({
        secret: enrollment.secret,
        encoding: "base32",
        token: code,
        window: 1
      });

      if (!verified) {
        return reply.code(400).send({ error: "Invalid MFA code." });
      }

      await prisma.user.update({
        where: { id: enrollment.userId },
        data: {
          mfaSecret: enrollment.secret,
          mfaEnabled: true
        }
      });

      await prisma.mfaEnrollment.delete({
        where: { id: enrollment.id }
      });

      await logAudit({
        action: "auth.mfa_enabled",
        actorId: enrollment.userId,
        targetType: "User",
        targetId: enrollment.userId,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]
      });

      return reply.send({ success: true });
    }
  );
}
