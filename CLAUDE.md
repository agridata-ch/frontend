# agridata.ch

Open-source zoneless Angular 22 (TypeScript 6.0) application using signals and resources for API data retrieval.

## Development Commands

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm install`           | Install dependencies                       |
| `npm start`             | Start dev server                           |
| `npm run build`         | Build for production                       |
| `npm run test:unit`     | Run unit tests (Jest)                      |
| `npm run test:coverage` | Run tests with coverage                    |
| `npm run lint`          | Lint source files                          |
| `npm run typecheck`     | Type-check without emitting                |
| `npm run api:sync:dev`  | Fetch & regenerate OpenAPI client from dev |
| `npm run i18n:extract`  | Extract i18n translation keys              |

## Project Structure

Follows [Feature Sliced Design](https://feature-sliced.design/). Layers may only import from layers below them.

```
src/
├── app/              # Bootstrap, routing, guards, interceptors, layouts
├── pages/            # One component per route
├── widgets/          # Self-contained UI blocks composed into pages
├── features/         # User interaction slices
├── entities/
│   ├── api/          # Business domain services
│   ├── cms/          # CMS entity
│   └── openapi/      # ⚠️ Auto-generated — never edit (regenerate: npm run api:sync:local)
├── shared/           # Reusable infrastructure (ui, lib, utils, testing mocks)
├── assets/
│   ├── de.json       # ⚠️ Auto-generated — never edit (regenerate: npm run i18n:sync)
│   ├── fr.json       # ⚠️ Auto-generated — never edit
│   ├── it.json       # ⚠️ Auto-generated — never edit
│   └── ...           # Static assets, openapi.yaml, form schemas
├── environments/     # Dev / staging / prod configs
└── styles/           # Global Tailwind and CSS variable definitions
```

Dependency direction: `app` → `pages` → `widgets` → `features` → `entities` → `shared`

## Framework & Patterns

- No RxJS - use signals or promises instead
- Use Angular 22 recommended techniques: effects, computed signals, resources
- Zoneless application - keep this in mind for change detection

## Type Safety

- Everything must be type safe
- No `any` type
- No type casting — use proper types or type guards instead

## Code Style

- Strive for simplicity and clean code
- Tailwind for styling, minimalistic styles only
- Imports ordered alphabetically

## Property Order in Classes

Arrange in this order - use a comment per category when a category has 3 or more properties:

1. Injects
2. Constants
3. Input properties
4. Model properties
5. Output properties
6. Signals
7. Computed Signals
8. Effects

Within each category: public → protected → private

### Visibility

- Only input/output properties should be public
- Properties used by HTML: protected
- All others: private
- Make properties `readonly` where possible

## Functions

Sort alphabetically and by visibility: public → protected → private

## Output Naming

Output names must contain a verb (e.g. `handle`) so they read as methods — `saveClicked` → `handleSave`. Never prefix with `on`.

## Arrays

Never sort in place - always sort a copy: `[...myArray].sort(...)`

## Class Comments

Add JSDoc to all classes except test classes:

```
/**
 * Brief description of what the component does.
 *
 * CommentLastReviewed: YYYY-MM-DD  ← always use today's date
 */
```

---

## Testing

For comprehensive testing guidance, use the **unit-tests-agridata** skill. It covers:

- Signal and input testing patterns
- Service mocking with the agridata mock conventions
- Resource loading and async testing
- Component interaction testing (button clicks, form input)
- DOM element selection best practices
- Test refactoring and modernization

---

## Routes

Route map is defined in `src/app/app.routes.ts` — each route's roles are in
`data.roles`, guards in `canActivate`, and page component in `component`. Literal
path strings and role strings live in `ROUTE_PATHS` / `USER_ROLES` in
`src/shared/constants/constants.ts`. Read those two files when working on routing,
guards, or navigation.

codesight auto-detects only ~4 routes (paths come from the `ROUTE_PATHS` constant it
can't resolve) — ignore its route count in the AI Context block below.

# frontend — Project Context

**Stack:** angular | none | typescript

4 routes | 0 models | 6 env vars | 2146 import links

**API areas:** /auth-response, /, /:dataProductId, /\*\*

**High-impact files** (change carefully):

- src/shared/i18n/index.ts (imported by 145 files)
- src/entities/openapi/index.ts (imported by 123 files)
- src/entities/api/agridata-state.service.ts (imported by 81 files)
- src/shared/constants/constants.ts (imported by 76 files)
- src/app/error/error-handler.service.ts (imported by 66 files)

**Required env vars:** CI

---

## Instructions for Claude Code

### Two-Step Rule (mandatory)

**Step 1 — Orient:** Use wiki articles to find WHERE things live.
**Step 2 — Verify:** Read the actual source files listed in the wiki article BEFORE writing any code.

Wiki articles are structural summaries extracted by AST. They show routes, models, and file locations.
They do NOT show full function logic, middleware internals, or dynamic runtime behavior.
**Never write or modify code based solely on wiki content — always read source files first.**

Read in order at session start:

1. `.codesight/wiki/index.md` — orientation map (~200 tokens)
2. `.codesight/wiki/overview.md` — architecture overview (~500 tokens)
3. Domain article (e.g. `.codesight/wiki/auth.md`) → check "Source Files" section → read those files
4. `.codesight/CODESIGHT.md` — full context map for deep exploration

Routes marked `[inferred]` in wiki articles were detected via regex — verify against source before trusting.
If any source file shows ⚠ in the wiki, re-run `npx codesight --wiki` before proceeding.

Or use the codesight MCP server for on-demand queries:

- `codesight_get_wiki_article` — read a specific wiki article by name
- `codesight_get_wiki_index` — get the wiki index
- `codesight_get_summary` — quick project overview
- `codesight_get_routes --prefix /api/users` — filtered routes
- `codesight_get_blast_radius --file src/lib/db.ts` — impact analysis before changes
- `codesight_get_schema --model users` — specific model details

Only open specific files after consulting codesight context. This saves ~102,920 tokens per conversation.
