---
name: new-component
description: Scaffold an Angular component in the correct Feature Sliced Design layer following agridata conventions (property order, visibility, JSDoc, index barrel, spec).
disable-model-invocation: true
argument-hint: <layer>/<slice> [purpose]
---

# New Component

Scaffold `$ARGUMENTS` as a new standalone component.

## 1. Pick the layer

Ask only if the argument doesn't make it clear.

| Layer       | Use for                                                   |
| ----------- | --------------------------------------------------------- |
| `pages`     | One component per route (also register in app.routes.ts)  |
| `widgets`   | Self-contained UI block composed into pages               |
| `features`  | One user interaction slice                                |
| `shared/ui` | Generic, domain-free UI (selector prefix `app-agridata-`) |

A component may only import from layers **below** its own (`app → pages → widgets → features → entities → shared`). Before writing anything, look for an existing component in `src/shared/ui` or the target layer that already does the job (ladder rule: reuse first).

## 2. Files

`src/<layer>/<slice>/` with kebab-case `<name>`:

- `<name>.component.ts`
- `<name>.component.html`
- `<name>.component.spec.ts`
- `index.ts`: `export * from './<name>.component';`

Model the files on `src/shared/ui/agridata-tabs/`.

## 3. Component rules (CLAUDE.md)

```ts
import { Component, computed, inject, input, output, signal } from '@angular/core';

/**
 * <One or two sentences: what it renders and what it emits.>
 *
 * CommentLastReviewed: <TODAY YYYY-MM-DD>
 */
@Component({
  selector: 'app-<name>',
  imports: [],
  templateUrl: './<name>.component.html',
})
export class <Name>Component {
  // order: injects, constants, inputs, models, outputs, signals, computed, effects
  // within each: public -> protected -> private; comment a category only when it has 3+ members
  private readonly i18nService = inject(I18nService);

  readonly item = input.required<ItemDto>();

  readonly handleSelect = output<string>(); // verb in name, never `on` prefix

  protected readonly isOpen = signal(false);

  protected readonly label = computed(() => ...);

  // functions: alphabetical, public -> protected -> private
}
```

- Imports in alphabetical order. Use `@/` path aliases across slices.
- No `constructor()`: use field initializers. No RxJS. No `any`, no casts.
- Only inputs/outputs are public. Template members are `protected`. Everything else is `private`. Use `readonly` wherever possible.
- Services inject themselves into sub-components. Don't pass service-derived values down as inputs.
- Clickable actions use `app-agridata-button`, never a raw `<button>`.
- Tailwind classes only, kept minimal. Use `[class.h-[..]]`, never `[style.height]`.
- Errors go through `ErrorHandlerService.handleError` and an `app-error-outlet`.
- Text goes through transloco. Return new keys in quoted dot-notation for PoEditor. Never edit `src/assets/{de,fr,it}.json`.

## 4. Spec

Invoke the **unit-tests-agridata** skill and follow it for the `.spec.ts` (use the `component` alias, `componentRef.setInput()`, `toHaveLength`).

## 5. Verify

```bash
npm run lint && npm run typecheck && npm run test:unit -- src/<layer>/<slice> && npm run test:arch
```

Then call `mcp__ide__getDiagnostics` on the new files and fix any Sonar findings. Never commit.
