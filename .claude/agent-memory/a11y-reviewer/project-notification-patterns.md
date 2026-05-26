---
name: project-notification-patterns
description: A11y patterns and anti-patterns found during the notification overlay + notification center page audit (2026-05-26)
metadata:
  type: project
---

Recurring accessibility issues found in the notification components (overlay and center page):

1. **Non-semantic interactive div pattern** — The "mark as read" indicator is a `<div>` with `(click)` and `(keydown)` but no `role`, `tabindex`, or `aria-label`. Both `notification-overlay-content` and `notification-center-page` share this exact same pattern. Fix: replace with `<button>` or add `role="button" tabindex="0" aria-label="..."`.

2. **Missing `aria-label` on icon-only / visually-ambiguous interactive elements** — The green dot indicator conveys read/unread state visually only; no programmatic equivalent is exposed to AT.

3. **`keydown` handler fires on ALL keys** — `(keydown)="handleMarkAsRead(notification)"` triggers on any key (Tab, arrow, etc.). Should guard to `Enter`/`Space` only, or use `<button>` which handles this natively.

4. **`[title]` set to empty string when read** — `[title]="item.isRead ? '' : t('markAsRead')"` means read notifications have no accessible name at all on the indicator element.

5. **`<fa-icon>` decorative icons not hidden from AT** — Icons inside headings and empty-state panels are not marked `aria-hidden="true"`.

6. **`disabled` button in empty state is not a skip-nav pattern** — The `showAll` button in the empty state is `disabled`; it provides no navigation affordance for AT users, but the intent is to navigate. Consider removing or using `aria-disabled` + explaining why.

7. **Button focus styles** — Most `.agridata-button` variants define `outline-width: 4px` globally but only `primary-accept`, `secondary-reject`, `icon`, `icon-outline`, and `filter` variants have an explicit `:focus` rule activating the outline. `primary`, `secondary`, `tertiary`, `link`, and `icon-link` variants rely on the browser's default outline (which Tailwind's preflight resets). Verify browsers show a visible ring on these variants.

**Why:** — First full a11y audit of the notification feature, 2026-05-26.
**How to apply:** — When reviewing any new feature that reuses the "dot indicator as clickable element" pattern, flag it immediately. The `<button>`-replacement fix is the canonical resolution in this codebase.
