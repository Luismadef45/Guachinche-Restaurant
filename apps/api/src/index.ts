import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { APP_NAME } from "@guachince/shared";
import { registerHealthRoutes } from "./modules/health";

const port = Number(process.env.API_PORT ?? 3001);
const host = process.env.API_HOST ?? "0.0.0.0";

const app = Fastify({ logger: true });

app.register(swagger, {
  openapi: {
    info: {
      title: `${APP_NAME} API`,
      version: "0.1.0"
    },
    tags: [{ name: "system", description: "Health and readiness" }]
  }
});

app.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false
  }
});

app.get(
  "/",
  {
    schema: {
      description: "API entry point",
      tags: ["system"],
      response: {
        200: {
          type: "object",
          properties: {
            name: { type: "string" },
            docs: { type: "string" }
          },
          required: ["name", "docs"]
        }
      }
    }
  },
  async () => ({ name: APP_NAME, docs: "/docs" })
);

app.register(registerHealthRoutes);

const start = async () => {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
