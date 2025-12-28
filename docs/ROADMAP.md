# Project Roadmap

Notes

- Each task has a unique tag and command to show its context in this file.
- Run commands from the repo root.

## TASK-01-LANDING - Customer landing page routing

Status: [x] Done
Context

- Entry choice: Eat-in (QR), Takeaway, Delivery, Book a table, Menu browsing.
- If opened from a QR code, default to Eat-in and table session start.
- Save the last chosen path in cookie/local storage.
  Command
- rg -n "TASK-01-LANDING" -C 8 docs/ROADMAP.md
  Deliverables
- Landing route with clear experience choices.
- QR detection and automatic Eat-in entry.
- Preference persistence and deep links to booking, ordering, and menu.

## TASK-02-FOUNDATION - Repo and tooling foundation

Status: [x] Done
Context

- Monorepo setup (Turborepo).
- ESLint, Prettier, commit hooks.
- Environment config strategy (local, staging, prod).
- Docker Compose for Postgres and Redis.
- CI pipeline: lint, typecheck, tests; security scanning.
  Command
- rg -n "TASK-02-FOUNDATION" -C 8 docs/ROADMAP.md
  Deliverables
- Turborepo workspace with baseline packages (web, api, shared).
- Unified linting/formatting and pre-commit hooks.
- Docker Compose and CI workflows wired.

## TASK-03-ARCHITECTURE - Backend framework and API baseline

Status: [x] Done
Context

- TypeScript everywhere; modular monolith with strict boundaries.
- Choose backend framework (NestJS or Fastify) and REST + OpenAPI.
- Define module boundaries for domain contexts.
  Command
- rg -n "TASK-03-ARCHITECTURE" -C 8 docs/ROADMAP.md
  Deliverables
- Architecture decision record (ADR) for backend and API style.
- Initial API server scaffold with OpenAPI docs endpoint.
- Package/module boundaries documented.

## TASK-04-DATA-MODEL - Core data model and Prisma schema

Status: [x] Done
Context

- Entities include RestaurantLocation, User, Role, Permission, Table, Booking,
  MenuItem, Modifier, Allergen, Ingredient, InventoryBatch, Order, Ticket,
  LoyaltyWallet, Campaign, Testimonial, Shift, ClockEvent, Rota.
  Command
- rg -n "TASK-04-DATA-MODEL" -C 8 docs/ROADMAP.md
  Deliverables
- Prisma schema and initial migrations for core entities.
- Seed data for roles and basic restaurant setup.

## TASK-05-AUTH-RBAC - Authentication and permissions

Status: [ ] Not started
Context

- Roles: Customer, Waiter, Chef, Shift Manager, General Manager, Admin/Owner,
  Accountant/Analyst (read-only metrics).
- Secure sessions, password reset, MFA for staff (manager/admin minimum).
- Permission guards per endpoint and UI action.
  Command
- rg -n "TASK-05-AUTH-RBAC" -C 8 docs/ROADMAP.md
  Deliverables
- Auth endpoints and session handling.
- RBAC middleware/guards and permissions matrix doc.
- Audit logs for sensitive actions.

## TASK-06-RESTAURANT-SETUP - Locations, hours, tables

Status: [ ] Not started
Context

- Restaurant locations, opening hours, service times, tables, floor plan.
- Supports table capacity and combinability rules.
  Command
- rg -n "TASK-06-RESTAURANT-SETUP" -C 8 docs/ROADMAP.md
  Deliverables
- Admin UI and API for locations, hours, tables, floor plan data.
- Validation for capacities and service windows.

## TASK-07-MENU - Menu and pricing management

Status: [ ] Not started
Context

- Manage dishes, categories, modifiers, allergens, dietary labels, photos.
- Menu of the day with scheduling and limited quantities.
- Audit trail for all changes.
  Command
- rg -n "TASK-07-MENU" -C 8 docs/ROADMAP.md
  Deliverables
- Menu CRUD with photo upload and allergen tagging.
- Menu of the day scheduling and version history.

## TASK-08-BOOKINGS - Customer and staff booking system

Status: [ ] Not started
Context

- Booking flow: party size -> time -> contact -> requests -> confirmation.
- Availability rules, turn times, buffers, waitlist, deposits (optional).
- Modifications, cancellations, and no-show tracking.
  Command
- rg -n "TASK-08-BOOKINGS" -C 8 docs/ROADMAP.md
  Deliverables
- Booking UI and API with availability engine.
- Confirmation notifications and modification flow.
- Staff view for bookings and walk-ins.

## TASK-09-EATIN - Eat-in QR ordering and table sessions

Status: [ ] Not started
Context

- QR ties to table ID and session token.
- Customer order flow, call waiter requests, allergen confirmations.
- Split bills (seat-based or later POS split).
  Command
- rg -n "TASK-09-EATIN" -C 8 docs/ROADMAP.md
  Deliverables
- Table session creation/validation and QR handling.
- Eat-in ordering flow and service requests.
- Allergen confirmation step recorded per order.

## TASK-10-TAKEAWAY-DELIVERY - Ordering for pickup and delivery

Status: [ ] Not started
Context

- Menu browsing, item customizations, cart/checkout.
- Pickup scheduling and capacity; delivery zones/fees and ETA.
- Payments via provider, order tracking status updates.
  Command
- rg -n "TASK-10-TAKEAWAY-DELIVERY" -C 8 docs/ROADMAP.md
  Deliverables
- Takeaway and delivery ordering flows with validation.
- Delivery zone logic and order tracking.

## TASK-11-KDS - Kitchen display and ticket flow

Status: [ ] Not started
Context

- Ticket statuses: accepted, in prep, ready, served.
- Stations and timing; "mains away" acknowledgment.
- Cutlery recommendations tied to dish rules.
  Command
- rg -n "TASK-11-KDS" -C 8 docs/ROADMAP.md
  Deliverables
- KDS UI with station filters and ticket status updates.
- Ticket event timeline and alerts for delays.

## TASK-12-INVENTORY - Inventory and availability sync

Status: [ ] Not started
Context

- Ingredients tracked with stock, reserved stock, reorder thresholds.
- Recipes (BOM) link dishes to ingredients.
- Auto-disable dishes when ingredients are low; manual 86 with audit log.
  Command
- rg -n "TASK-12-INVENTORY" -C 8 docs/ROADMAP.md
  Deliverables
- Inventory models and stock movements.
- Availability engine that updates menus across channels.

## TASK-13-WAITER-OPS - Waiter tooling and service orchestration

Status: [ ] Not started
Context

- Live floor plan, booking list, walk-ins, waitlist management.
- Service intelligence: "mains away", alerts, allergen flags.
- Cutlery prompts and service requests.
  Command
- rg -n "TASK-13-WAITER-OPS" -C 8 docs/ROADMAP.md
  Deliverables
- Waiter dashboard with table status and booking controls.
- Service request handling and alert surfaces.

## TASK-14-SOMMELIER - Beverage pairing rules and UI

Status: [ ] Not started
Context

- Start rules-based pairing table with constraints and explanations.
- Respect inventory and price range guidance.
- Track acceptance for future ranking.
  Command
- rg -n "TASK-14-SOMMELIER" -C 8 docs/ROADMAP.md
  Deliverables
- Pairing rules data model and admin UI.
- Waiter UI suggestions with stored explanations.

## TASK-15-LOYALTY-CRM - Loyalty, campaigns, testimonials

Status: [ ] Not started
Context

- Points accrual/redemption, tiers, wallet view.
- Consent management for marketing.
- Testimonials with moderation queue.
  Command
- rg -n "TASK-15-LOYALTY-CRM" -C 8 docs/ROADMAP.md
  Deliverables
- Loyalty wallet and redemption flows.
- Campaign and consent tracking.
- Testimonial submission and moderation UI.

## TASK-16-MANAGER - Inventory, analytics, time tracking, rota

Status: [ ] Not started
Context

- Stock overview, purchase orders, low stock alerts.
- Analytics dashboards and CSV exports.
- Time tracking, productivity, rota builder with constraints.
  Command
- rg -n "TASK-16-MANAGER" -C 8 docs/ROADMAP.md
  Deliverables
- Manager back office modules for inventory, analytics, time, and rota.
- Approval workflows for adjustments and swaps.

## TASK-17-OBSERVABILITY - Logs, tracing, audit

Status: [ ] Not started
Context

- Structured JSON logs with correlation IDs.
- Sentry-style error tracking.
- Audit logs for sensitive actions with before/after snapshots.
  Command
- rg -n "TASK-17-OBSERVABILITY" -C 8 docs/ROADMAP.md
  Deliverables
- Logging middleware and audit schema.
- Error tracking integration and alert hooks.

## TASK-18-REALTIME - Realtime updates and events

Status: [ ] Not started
Context

- WebSocket/SSE for staff dashboards and ticket updates.
- Event model: menu.updated, inventory.updated, booking.created, order.paid,
  ticket.status_changed, loyalty.points_awarded.
  Command
- rg -n "TASK-18-REALTIME" -C 8 docs/ROADMAP.md
  Deliverables
- Realtime gateway and internal event bus.
- Live updates for KDS and waiter views.

## TASK-19-SECURITY - Security hardening

Status: [ ] Not started
Context

- Input validation, rate limiting, secure headers/CSP.
- Secrets management and no card data storage (provider only).
- Least privilege review and backup/restore plan.
  Command
- rg -n "TASK-19-SECURITY" -C 8 docs/ROADMAP.md
  Deliverables
- Validation layer, rate limiting, CSP config.
- Secrets policy and documented backup/restore plan.

## TASK-20-PERFORMANCE - Caching and performance strategy

Status: [ ] Not started
Context

- CDN caching for static assets.
- Next.js caching/ISR for menu pages.
- Redis caching for menu, availability, booking queries with invalidation rules.
  Command
- rg -n "TASK-20-PERFORMANCE" -C 8 docs/ROADMAP.md
  Deliverables
- Caching policy and Redis cache layer.
- Invalidation rules wired to menu/inventory/booking changes.

## TASK-21-AWS - Staging and production migration

Status: [ ] Not started
Context

- AWS plan: ECS Fargate, RDS Postgres, ElastiCache Redis, S3, CloudFront,
  CloudWatch, WAF, ALB, GitHub Actions CI/CD.
- Staging mirrors production.
  Command
- rg -n "TASK-21-AWS" -C 8 docs/ROADMAP.md
  Deliverables
- AWS architecture doc and env configs.
- CI/CD deploy pipeline for staging and production.
