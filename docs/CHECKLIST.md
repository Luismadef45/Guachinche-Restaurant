# Restaurant Web-App Master Checklist
Status legend: [ ] Not started  [~] In progress  [x] Done  [!] Blocked

## 0) Project Foundation
- [ ] Monorepo created (Turborepo)
- [ ] Code standards (ESLint, Prettier, commit hooks)
- [ ] Environment config strategy (local/staging/prod)
- [ ] Docker Compose: Postgres + Redis
- [ ] CI pipeline: lint + typecheck + tests
- [ ] Security scanning (dependencies + secrets)

## 1) Core Platform (Backend)
### Auth & Roles (RBAC)
- [ ] User roles: Customer / Waiter / Chef / Manager / Admin
- [ ] Login + secure sessions
- [ ] Password hashing + reset flow
- [ ] Permission guards per endpoint

### Logging / Observability
- [ ] Structured backend logs (JSON)
- [ ] Correlation IDs per request
- [ ] Sentry integrated (frontend + backend)
- [ ] Audit log for sensitive actions

### Core Data Models (Prisma)
- [ ] Users / Roles
- [ ] Restaurant tables / table sessions
- [ ] Menu items / ingredients / allergens
- [ ] Orders / order items / modifiers
- [ ] Bookings
- [ ] Inventory / stock movements
- [ ] Loyalty ledger / rewards
- [ ] Testimonials moderation queue
- [ ] Checklists + tasks
- [ ] Waste logs
- [ ] Time tracking
- [ ] Rota schedules

## 2) Customer Web (Next.js)
### Landing & Routing
- [ ] Landing page (Eat-in vs Takeaway/Delivery)
- [ ] QR-based table session start (Eat-in)

### Booking
- [ ] Booking UI (date/time/party size)
- [ ] Modify/cancel booking
- [ ] Booking confirmation flow

### Takeaway & Delivery Ordering
- [ ] Menu browsing
- [ ] Item customization (allergens/alternatives)
- [ ] Cart + checkout
- [ ] Delivery address + zone logic
- [ ] Order tracking page

### Loyalty + Membership + Testimonials
- [ ] Points accrual logic visible to user
- [ ] Rewards redemption
- [ ] Membership tiers (if enabled)
- [ ] Testimonial upload + pending state

## 3) Staff Web (Waiters)
### Table & Booking Ops
- [ ] Booking management view
- [ ] Table assignment & walk-ins
- [ ] Table status overview (active orders, timings)

### Service Intelligence
- [ ] Cutlery recommendations per order
- [ ] ?Mains away? kitchen signal
- [ ] Alerts (waiting too long, allergen flags)

### Sommelier Recommendations
- [ ] Wine list management (manager/chef configurable)
- [ ] Pairing rules engine v1
- [ ] Waiter UI recommendations with explanations

## 4) Staff Web (Chefs / Kitchen Ops)
### Menu Management
- [ ] Edit prices
- [ ] Edit ingredients + allergens mapping
- [ ] Upload photos
- [ ] Menu of the day workflow

### Checklists & H&S
- [ ] Checklist templates (open/close/clean/prep)
- [ ] Assign tasks to staff
- [ ] Completion + timestamps
- [ ] Manager visibility/reporting

### Waste & Storage Metrics
- [ ] Waste logging UI
- [ ] Storage checks + expiry tracking
- [ ] Waste trend dashboard

### Ingredient Availability Sync
- [ ] Stock-level ingredient tracking
- [ ] Automatic dish disable when ingredient missing
- [ ] Sync applies to eat-in + takeaway + delivery
- [ ] Cache invalidation on changes
- [ ] Manual override with audit log

## 5) Manager Back Office
### Inventory + Refill
- [ ] Stock overview
- [ ] Sales-linked consumption (recipe deduction)
- [ ] Low stock alerts
- [ ] Purchase list generation

### Analytics
- [ ] Revenue + best sellers
- [ ] Waste cost
- [ ] Service speed metrics
- [ ] Loyalty effectiveness
- [ ] Export CSV

### Time Tracking & Productivity
- [ ] Clock in/out
- [ ] Role/station tagging
- [ ] Approvals
- [ ] Productivity dashboard

### Rota
- [ ] Rota builder UI
- [ ] Staff availability constraints
- [ ] Auto-rota generator v1
- [ ] Publish rota + notifications hook

## 6) Real-time Systems
- [ ] WebSocket gateway (API)
- [ ] Kitchen Display Screen (KDS)
- [ ] Real-time table updates (waiters)
- [ ] Real-time order status updates (customers)

## 7) Security Hardening
- [ ] Input validation everywhere
- [ ] Rate limiting
- [ ] Secure headers + CSP
- [ ] Secrets management policy
- [ ] Least privilege roles review
- [ ] Backup/restore testing plan

## 8) AWS Migration (Staging then Production)
- [ ] AWS staging environment plan
- [ ] RDS Postgres setup
- [ ] ElastiCache Redis setup
- [ ] S3 for images + CloudFront CDN
- [ ] ECS Fargate deployment pipeline
- [ ] CloudWatch alarms + dashboards
- [ ] WAF baseline rules
- [ ] Load testing (k6) against staging
