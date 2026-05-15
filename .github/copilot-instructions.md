# GitHub Copilot Instructions for `mub_backend`

These instructions guide AI coding agents (like GitHub Copilot in VS Code) working in this NestJS + Prisma backend.

## Architecture & Domains

- This is a modular NestJS monolith using feature modules under `src/modules/*` (e.g. `auth`, `applicants`, `employers`, `local-agencies`, `visa`, `expenses`, `reports`).
- The root module [src/app.module.ts](src/app.module.ts) wires infrastructure modules (`ConfigModule`, `ThrottlerModule`, `PrismaModule`) and all domain modules; avoid introducing new cross-cutting modules unless necessary.
- Persistence is via Prisma with a PostgreSQL datasource; the schema lives in [prisma/schema.prisma](prisma/schema.prisma) and is the single source of truth for entities (users, roles/permissions, applicants, employers, local agencies, visa cases, expenses, etc.).
- Each feature module generally follows this structure:
  - `dto/` – request/response DTOs for Swagger + validation.
  - `presentation/` – HTTP controllers and route definitions.
  - `services/` – business logic and orchestration.
  - `repositories/` – data access abstractions over `PrismaService`.
  - `prisma/` – module-specific Prisma helpers (if present).
- Example pattern: the Applicants module in [src/modules/applicants](src/modules/applicants) has `presentation` controllers, `services` (e.g. `applicants.service.ts`), and repositories; mirror this layout when adding new features.

## HTTP API & Routing Conventions

- All HTTP routes are defined in `presentation` controllers and are prefixed with an explicit `@Controller` path rather than relying on global prefixes.
- Route namespaces reflect roles and areas:
  - Public: `api/public/*` (e.g. [PublicApplicantsController](src/modules/applicants/presentation/public-applicants.controller.ts), public skills, public employers/local-agencies registration).
  - Auth/account: `api/auth/*`, `api/account/*`.
  - Applicant self-service: `api/applicant/*`.
  - Employer self-service: `api/employer/*`.
  - Local agency self-service: `api/local-agency/*` and `api/agency/*` for some visa views.
  - Admin backoffice: `api/admin/*` (users, roles/permissions, applicants, employers, local agencies, jobs, visa, expenses, reports).
- Keep new routes consistent with these prefixes and role boundaries; avoid inventing new top-level prefixes without a strong reason.
- Use explicit HTTP verbs (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`) with descriptive subpaths (e.g. `:id/approve`, `:id/reject`, `:id/close`).

## Auth, Guards & RBAC

- Global guards are configured in [src/app.guards.ts](src/app.guards.ts) and applied in `AppModule`:
  - `JwtAuthGuard` – authenticates via JWT bearer tokens.
  - `ActiveUserGuard` – ensures the user is active.
  - `PermissionsGuard` – enforces fine-grained RBAC based on permissions.
- Public endpoints must be decorated with `@Public()` (see [src/common/decorators/public.decorator.ts](src/common/decorators/public.decorator.ts)); otherwise they will be protected by the global JWT/active-user guards.
- Permissions checks use `PermissionsGuard` and a custom decorator (e.g. `@RequirePermissions(...)`) which sets metadata read via `RBAC.PERMISSIONS_KEY` in [src/common/guards/permissions.guard.ts](src/common/guards/permissions.guard.ts).
- When adding new admin or privileged endpoints, always:
  - Add appropriate permission codes to Prisma `Permission` / seed files under [prisma/seed](prisma/seed).
  - Decorate handlers/classes with the project’s RBAC decorator instead of ad-hoc role checks.

## Validation, DTOs & Swagger

- Global validation is configured in [src/main.ts](src/main.ts) via `ValidationPipe` with:
  - `whitelist: true` and `forbidNonWhitelisted: true` – unknown properties are rejected.
  - `transform: true` – input is transformed to DTO instances.
- All request bodies should use DTO classes located under the module’s `dto/` folder; this ensures consistent validation and OpenAPI docs.
- Swagger is configured in [src/main.ts](src/main.ts) with:
  - JWT bearer auth (`bearer` scheme).
  - An API key security scheme named `draft` for the `X-Draft-Token` header used in draft applicant flows.
- When adding new endpoints:
  - Use `@ApiTags` on controllers and `@ApiOperation` on handlers.
  - Reuse existing patterns for `@ApiResponse` schemas where possible (see [public-applicants.controller.ts](src/modules/applicants/presentation/public-applicants.controller.ts) for examples).

## File Uploads & Static Files

- File uploads use `multer` with `diskStorage`, central helpers, and a fixed directory layout.
- Upload-related helpers live under [src/common/utils/upload](src/common/utils/upload); for example, `buildUploadsRoot`, `ensureDir`, `safeExt`, `maxUploadBytes`, and `safeDeleteUploadByRelativePath`.
- The `main.ts` bootstrap sets up:
  - `UPLOAD_DIR` env (or `uploads/` by default) as the storage root.
  - Static file serving for `app.useStaticAssets(uploadDir, { prefix: '/uploads' })`.
- When implementing new upload endpoints:
  - Use `FileFieldsInterceptor` or similar, pointing to `buildUploadsRoot()` and subdirectories that match existing conventions (`/uploads/applicants/*`, `/uploads/employers/*`, etc.).
  - Return URLs starting with `/uploads/...` so they are directly accessible via the configured static assets.

## Environment, Config & Throttling

- Environment variables are validated using Zod in [src/config/env.validation.ts](src/config/env.validation.ts); adding new required env vars should update this schema and surface clear error messages.
- Application configuration is centralized in [src/config/configuration.ts](src/config/configuration.ts), exposing typed sections for `app`, `jwt`, `refreshToken`, `passwordReset`, `throttle`, and `mail`.
- Rate limiting is configured through [src/config/throttle.config.ts](src/config/throttle.config.ts) and applied in `AppModule` via `ThrottlerModule.forRoot(throttleConfig())`; avoid ad-hoc throttling in controllers.

## Prisma & Data Access

- All DB access should go through `PrismaService` (see [src/database/prisma.service.ts](src/database/prisma.service.ts)), ideally encapsulated in repositories under `repositories/` to keep services focused on business logic.
- When changing models in [prisma/schema.prisma](prisma/schema.prisma), remember the expected flows:
  - User lifecycle (`User`, `UserRole`, `Role`, `Permission`, `RefreshToken`, `AccountActionToken`).
  - Applicant lifecycle (draft → submitted → verified/rejected) via `ApplicantProfile`, `ApplicantDraftToken`, related documents and status fields.
  - Local agencies, employers, visa cases, and expense tracking entities.
- Use `$transaction` for multi-step operations that must be atomic (see `ensureApplicantUserOnSubmit` in [applicants.service.ts](src/modules/applicants/services/applicants.service.ts)).

## Developer Workflows

- Install dependencies: `npm install`.
- Run the app:
  - `npm run start` – development without watch.
  - `npm run start:dev` – watch mode for local development.
  - `npm run start:prod` – production mode.
- Tests:
  - `npm run test` – unit tests.
  - `npm run test:e2e` – e2e tests.
  - `npm run test:cov` – coverage.
- The Nest app exposes Swagger docs at `/api/docs` (see [src/main.ts](src/main.ts)); use this to verify new endpoints and schemas.

## Patterns to Follow When Extending

- Prefer adding new endpoints to existing modules that own the relevant domain (e.g. applicants, employers, visa, expenses) instead of creating generic/utility modules.
- Mirror existing controller/service/repository splits and keep controllers thin, delegating to services.
- Reuse existing helpers (RBAC decorators, upload utils, config accessors) instead of re-implementing similar logic.
- Keep route naming, response shapes, and error handling consistent with similar existing endpoints in the same module.
