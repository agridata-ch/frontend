# App.routes

> **Navigation aid.** Route list and file locations extracted via AST. Read the source files listed below before implementing or modifying this subsystem.

The App.routes subsystem handles **3 routes** and touches: auth.

## Routes

- `GET` `/auth-response` [auth] `[inferred]`
  `src/app/app.routes.ts`
- `GET` `/:dataProductId` params(dataProductId) [auth] `[inferred]`
  `src/app/app.routes.ts`
- `GET` `/**` [auth] `[inferred]`
  `src/app/app.routes.ts`

## Source Files

Read these before implementing or modifying this subsystem:
- `src/app/app.routes.ts`

---
_Back to [overview.md](./overview.md)_