# Git Hooks

> **Note for agents:** These hooks fire automatically on git operations and will block the operation if they fail.

## `pre-commit` — husky

- **npm**: `npm run prettier:staged && npx eslint src/ && src/scripts/check-comments.sh`

## `commit-msg` — husky

- **npx**: `npx --no -- commitlint --edit "$1"`

_Source: .husky/commit-msg, .husky/pre-commit_
