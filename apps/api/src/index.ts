import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { APP_NAME } from "@guachince/shared";
import { registerHealthRoutes } from "./modules/health";
import { registerAuthRoutes } from "./modules/auth";
import { registerUserRoutes } from "./modules/users";
import { registerAuthPlugin } from "./plugins/auth";

const port = Number(process.env.API_PORT ?? 3001);
const host = process.env.API_HOST ?? "0.0.0.0";

const app = Fastify({ logger: true });
const allowedOrigins = process.env.WEB_ORIGIN
  ? process.env.WEB_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0)
  : ["http://localhost:3000"];

app.register(cookie, {
  secret: process.env.AUTH_COOKIE_SECRET
});

app.register(cors, {
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true
});

app.register(registerAuthPlugin);

app.register(swagger, {
  openapi: {
    info: {
      title: `${APP_NAME} API`,
      version: "0.1.0"
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "grst_session"
        }
      }
    },
    tags: [
      { name: "system", description: "Health and readiness" },
      { name: "auth", description: "Authentication and session management" },
      { name: "users", description: "User administration" }
    ]
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
app.register(registerAuthRoutes);
app.register(registerUserRoutes);

const start = async () => {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
