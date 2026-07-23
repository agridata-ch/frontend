# frontend — Overview

> **Navigation aid.** This article shows WHERE things live (routes, models, files). Read actual source files before implementing new features or making changes.

**frontend** is a typescript project built with angular.

## Scale

4 API routes · 145 UI components · 222 library files · 18 middleware layers · 6 environment variables

## Subsystems

- **[App.routes](./app.routes.md)** — 3 routes — touches: auth
- **[Infra](./infra.md)** — 1 routes — touches: auth

**UI:** 145 components (angular) — see [ui.md](./ui.md)

**Libraries:** 222 files — see [libraries.md](./libraries.md)

## High-Impact Files

Changes to these files have the widest blast radius across the codebase:

- `src/shared/i18n/index.ts` — imported by **147** files
- `src/entities/openapi/index.ts` — imported by **128** files
- `src/entities/api/agridata-state.service.ts` — imported by **81** files
- `src/shared/constants/constants.ts` — imported by **76** files
- `src/app/error/error-handler.service.ts` — imported by **66** files
- `src/shared/ui/button/index.ts` — imported by **65** files

## Required Environment Variables

- `CI` — `jest.config.ts`

---
_Back to [index.md](./index.md) · Generated 2026-07-23_