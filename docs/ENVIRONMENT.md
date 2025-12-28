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
