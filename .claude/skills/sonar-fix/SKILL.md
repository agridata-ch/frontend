---
name: sonar-fix
description: Parse pasted SonarQube/SonarCloud issues, fix each one in code, verify build + lint, then offer a commit.
when_to_use: |
  Use when user pastes SonarQube issue text (rule messages like "Refactor this function
  to reduce its Cognitive Complexity", "Code Smell", "Security Hotspot") or says
  "sonar", "sonarcube error", "fix sonar issues".
argument-hint: '[pasted Sonar issues — may also arrive in the same message]'
allowed-tools: 'Bash(bun:*), Bash(bunx:*), Bash(npm:*), Bash(npx:*), Bash(yarn:*), Bash(pnpm:*), Bash(tsc:*), Bash(eslint:*)'
---

# Sonar Fix

## Step 1: Parse

Extract per issue: rule message, file, line, severity. Sonar UI copy-paste is noisy — discard chrome like "Code Smell", "3 Minor", "5min effort", "Open", "Not assigned", tag lists. If no file/line is included, Grep for the quoted code snippet to locate it.

Present the parsed issue list (numbered) before fixing.

## Step 2: Fix — one issue at a time

Read the surrounding code first. Fix exactly the rule violation — no drive-by refactoring.

Recurring rules and their known-good fixes:

- **S3776 cognitive complexity** — extract helper functions, early returns, flatten nesting. Do not just move code.
- **Prefer `globalThis`** over `window`/`self`/`global`.
- **`export … from`** — replace import-then-export re-exports.
- **Named arrow functions** — name exported/assigned arrow function expressions.
- **`String.raw`** — for strings dominated by escaped backslashes.
- **Weak hash hotspot (MD5/SHA-1)** — if non-crypto use (ETag, cache key), keep and add the project's accepted marker/rename; if security-relevant, switch to SHA-256. Ask if unclear.
- **Useless empty object/expression** — remove.
- **Semantic HTML** — `<aside>`/`<section>` with `aria-label` instead of role-less `div`s.
- **Prefer `for…of`** over indexed loops/`forEach` on iterables.

## Step 3: Verify

Run the project's build, lint, and `tsc --noEmit` (detect commands from package.json). All must pass. A fix that breaks the build gets reverted and retried, not left broken.

## Step 4: Report + Commit

```
#N  rule → file:line → fix applied
```

Offer `/commit`. Type: `refactor` for code smells, `fix` for bug-class rules and security hotspots. Subject only, no body.
