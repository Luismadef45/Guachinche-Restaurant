# Architecture Overview

## Repo boundaries

- `apps/web`: Next.js customer experience and landing flows.
- `apps/api`: Fastify-based API server.
- `packages/shared`: shared constants, types, and helpers used by apps.

## API module boundaries

API code is organized by modules under `apps/api/src/modules`.

Each module owns:

- Routes and request/response schemas.
- Services and business logic.
- Data access for its domain.

Cross-module use should happen through exported services or shared types, not
by reaching into another module's internal files.

Planned modules:

- `booking`, `menu`, `orders`, `tables`, `users`, `inventory`, `loyalty`.
