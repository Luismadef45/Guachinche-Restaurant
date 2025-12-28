import type { FastifyInstance } from "fastify";
import { APP_NAME } from "@guachince/shared";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get(
    "/health",
    {
      schema: {
        description: "Service health check",
        tags: ["system"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              app: { type: "string" },
              time: { type: "string", format: "date-time" }
            },
            required: ["status", "app", "time"]
          }
        }
      }
    },
    async () => ({
      status: "ok",
      app: APP_NAME,
      time: new Date().toISOString()
    })
  );
}
