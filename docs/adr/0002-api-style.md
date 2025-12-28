# ADR 0002: API Style

Status: Accepted

## Context

The API must be easy for clients to consume and for staff to maintain.
We need consistent routing, documentation, and tooling that integrates with
frontend and future partner systems.

## Decision

Use REST with OpenAPI as the canonical contract.

## Consequences

- Each route exposes explicit HTTP semantics (GET/POST/PATCH/DELETE).
- OpenAPI docs are generated from route schemas and exposed at `/docs`.
- Future client generation and contract testing can be added from the OpenAPI
  definition.
