---
name: skill-review
description: Reviews a skill file for usefulness, genericness, token efficiency, and sharability — then offers to rewrite it.
when_to_use: |
  Use when authoring or refining a skill, or when user asks to "review this skill",
  "audit my skill", "improve a skill".
argument-hint: <skill-name or path to SKILL.md>
---

# Skill Review

Review the skill identified by `$ARGUMENTS`. Accept either a skill name (e.g. `health-report`) or a direct path to a `SKILL.md` file.

## Step 1: Locate the Skill

Search in order:

1. `$ARGUMENTS` as a direct file path
2. `~/.claude/skills/$ARGUMENTS/SKILL.md`
3. `~/.claude/skills/$ARGUMENTS.md`

If not found, tell the user and stop.

Read the full file before proceeding.

## Step 2: Frontmatter Lint

Quick structural check before the lenses:

- `name` matches the directory name (or filename without extension)
- `description` is trigger-shaped ("Use when X"), not a feature list
- `argument-hint` present if the skill reads `$ARGUMENTS`; single-quote the value if it contains both `"..."` and `:` (unquoted breaks YAML parsing silently)
- No fields duplicating each other's content verbatim

## Step 3: Evaluate Against Four Lenses

Score each lens: **Strong / Acceptable / Weak / Critical**. Every finding must cite a line number or quote the specific text.

---

### Lens 1: Usefulness

Does this skill deliver real, actionable value every time it's run?

- **Output format**: Is there a defined report/output structure, or does the result depend on Claude's mood?
- **Actionability**: Does each finding require a concrete reference (file:line, command, name)? Or does it allow vague summaries?
- **Re-runnability**: Would running this twice on the same project produce consistent, useful results?
- **Signal-to-noise**: Does the skill produce findings proportional to actual problems, or will it always generate output regardless?
- **Decision point**: Does the skill tell the user what to do next, or just describe what it found?

---

### Lens 2: Genericness

Can this skill run cold on any project without modification?

- **Hardcoded paths**: Any specific directories (`src/`, `app/`, `lib/`) assumed without discovery?
- **Hardcoded tools**: Any specific package manager (`bun`, `npm`), language, or framework assumed without detection?
- **Hardcoded conventions**: Any project-specific naming, architecture rules, or file patterns assumed?
- **Discovery step**: Does the skill inspect the project first to understand its shape, or does it dive straight into checks?
- **Conditional logic**: When a tool or file doesn't exist, does the skill degrade gracefully or break?

---

### Lens 3: Token Efficiency

Is every word in this skill earning its place?

- **Redundancy**: Are any instructions repeated across steps?
- **Verbose examples**: Are code examples longer than necessary to convey the point?
- **Over-specification**: Are there instructions that describe what Claude would do anyway (e.g. "read the file carefully")?
- **Unnecessary scaffolding**: Are there headers, sections, or transitions that add length without adding meaning?
- **Bloated report format**: Does the output template contain placeholder text that will always be emitted verbatim, inflating response size?

Estimate the prompt token count (rough word count × 1.3). Flag if above ~600 tokens for a focused skill, ~1000 for a broad one.

---

### Lens 4: Sharability

Could a developer on a different team, stack, or company use this skill without modification?

- **Internal references**: Any mentions of internal tools, services, ticket systems, or team names?
- **Assumed workflows**: Any references to project-specific workflows (e.g. a specific CI system, branching strategy, or spec format)?
- **Jargon**: Any terms that only make sense in the original project's context?
- **Environment assumptions**: Any assumptions about OS, shell, installed globals, or available credentials?
- **Portability of output**: Would the report format make sense to someone unfamiliar with this team's conventions?

---

## Step 4: Report

```
## Skill Review: <skill-name>

### Usefulness       [Strong / Acceptable / Weak / Critical]
- ✅ ...
- ⚠️ line N: ...
- ❌ line N: ...

### Genericness      [Strong / Acceptable / Weak / Critical]
- ✅ ...
- ⚠️ ...
- ❌ ...

### Token Efficiency [Strong / Acceptable / Weak / Critical]
- Estimated prompt tokens: ~N
- ✅ ...
- ⚠️ ...

### Sharability      [Strong / Acceptable / Weak / Critical]
- ✅ ...
- ⚠️ ...
- ❌ ...

---

### Overall          [Strong / Acceptable / Needs Work / Poor]

Top issues:
1. [lens] line N — description
2. [lens] line N — description
3. [lens] line N — description
```

## Step 5: Offer Rewrite

After the report, ask:

> Found N issues. Should I rewrite the skill to address them?
>
> - **Yes, full rewrite** — rewrite the entire skill applying all fixes
> - **Yes, targeted fixes** — fix only the Critical and Weak findings, keep the rest
> - **No** — report only

If the user confirms, produce the rewritten `SKILL.md` in full and offer to save it (overwriting the original or writing to a new path).

When rewriting:

- Preserve the original intent and scope exactly — do not add new checks or change what the skill does
- Apply only what the review identified as issues
- Prefer cutting over rewriting — if a section is redundant, remove it rather than rephrasing it
- Keep the frontmatter fields accurate after changes
