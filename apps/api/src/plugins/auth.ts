import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { hashToken } from "../lib/security";
import { getSessionCookieOptions, SESSION_COOKIE } from "../lib/session";

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true };
            };
          };
        };
      };
    };
  };
}>;

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  mfaEnabled: boolean;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
    sessionId?: string;
  }

  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requirePermissions: (
      permissions: string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRoles: (
      roles: string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const buildAuthUser = (user: UserWithRoles): AuthUser => {
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
    roles,
    permissions,
    mfaEnabled: user.mfaEnabled
  };
};

export async function registerAuthPlugin(app: FastifyInstance) {
  app.decorateRequest("user", undefined);
  app.decorateRequest("sessionId", undefined);

  app.decorate("requireAuth", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({ error: "Authentication required." });
    }
  });

  app.decorate("requirePermissions", (permissions: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "Authentication required." });
      }

      const missing = permissions.filter(
        (permission) => !request.user?.permissions.includes(permission)
      );

      if (missing.length) {
        return reply.code(403).send({
          error: "Insufficient permissions.",
          missing
        });
      }
    };
  });

  app.decorate("requireRoles", (roles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "Authentication required." });
      }

      const hasRole = roles.some((role) => request.user?.roles.includes(role));
      if (!hasRole) {
        return reply.code(403).send({
          error: "Insufficient role access.",
          required: roles
        });
      }
    };
  });

  app.addHook("preHandler", async (request, reply) => {
    const token = request.cookies?.[SESSION_COOKIE];
    if (!token) {
      return;
    }

    const tokenHash = hashToken(token);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
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
          }
        }
      }
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      reply.clearCookie(SESSION_COOKIE, getSessionCookieOptions());
      return;
    }

    if (!session.user.isActive) {
      reply.clearCookie(SESSION_COOKIE, getSessionCookieOptions());
      return;
    }

    request.user = buildAuthUser(session.user);
    request.sessionId = session.id;
  });
}
