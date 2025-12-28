# ADR 0001: Backend Framework

Status: Accepted

## Context

We need a backend framework that is fast, TypeScript-friendly, and easy to
extend as the system grows from a baseline API into multiple domain modules.
The framework must support OpenAPI generation and fit a modular monolith.

## Decision

Use Fastify for the API service.

## Consequences

- Fastify provides excellent performance and a small core with plugins.
- OpenAPI can be generated via @fastify/swagger and documented via
  @fastify/swagger-ui.
- We will standardize module registration as Fastify plugins for clear
  boundaries and composition.
