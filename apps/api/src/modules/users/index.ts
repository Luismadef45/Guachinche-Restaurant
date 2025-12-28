import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";

const userInclude = {
  roles: {
    include: {
      role: true
    }
  }
};

export async function registerUserRoutes(app: FastifyInstance) {
  app.get(
    "/api/admin/users",
    {
      schema: {
        description: "List users (staff only)",
        tags: ["users"],
        response: {
          200: {
            type: "object",
            properties: {
              users: { type: "array", items: { type: "object" } }
            }
          }
        }
      },
      preHandler: app.requirePermissions(["staff.read"])
    },
    async () => {
      const users = await prisma.user.findMany({
        include: userInclude,
        orderBy: { createdAt: "desc" }
      });

      const payload = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: user.roles.map((role) => role.role.name)
      }));

      return { users: payload };
    }
  );
}
