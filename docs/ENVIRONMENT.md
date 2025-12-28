# Environment Configuration

## Local development

- Copy the templates and create local overrides (do not commit the local files).
- `apps/web/.env.local` for Next.js.
- `apps/api/.env.local` for the API.

## Staging and production

- Use environment-specific files or CI secrets (`.env.staging`, `.env.production`).
- Keep real secrets out of git; store them in your deployment platform.

## Templates

- `apps/web/.env.example` lists client-safe variables.
- `apps/api/.env.example` lists server-side variables.

## Auth configuration (API)

- `WEB_ORIGIN` controls CORS for the web app.
- `AUTH_COOKIE_SECRET` signs cookies in production.
- `AUTH_SESSION_TTL_DAYS` controls session expiry.
- `AUTH_PASSWORD_RESET_TTL_MINUTES` controls reset token lifetime.
- `AUTH_MFA_ENROLL_TTL_MINUTES` controls MFA enrollment token lifetime.
