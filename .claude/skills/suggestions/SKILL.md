---
name: suggestions
description: Generate multiple implementation approaches with pros/cons, pattern analysis, and a recommendation.
when_to_use: |
  Use when exploring how to implement a feature, solve a problem, or refactor code.
  Trigger for open-ended questions like "how should I...", "what's the best way to...",
  "how would you approach...", or any question where multiple valid approaches exist
  and a comparison would help decide.
argument-hint: <description of what you want to implement or solve>
---

When the user describes a task or problem via $ARGUMENTS, generate a structured comparison of implementation approaches. Do NOT implement anything — only analyze and suggest.

## 1. Understand the Problem

- Restate the problem/goal in one sentence.
- Read relevant files and check existing patterns in project docs (README, docs/, or similar) to identify codebase constraints.
- If $ARGUMENTS is vague, ask 1-2 targeted clarifying questions before proceeding.

## 2. Generate Approaches

Present **2-4 distinct approaches** using this compact format per approach:

```
### Approach N: [Name]
[One-sentence summary]

- **How:** Bullet-point implementation outline. Include short code snippets only for key/non-obvious parts.
- **Pros:** [concise list]
- **Cons:** [concise list]
- **Patterns:** [pattern names only — explain only if user asks]
- **Commonality:** [Universal | Very Common | Common | Uncommon | Exotic] — note if it differs between industry and this codebase
- **Complexity / Risk:** [Low|Med|High] / [Low|Med|High]
```

### Codebase Alignment Rule

Always check how the codebase currently handles similar problems. If industry best practice differs from the existing codebase pattern, present both and explicitly compare them:

- "Codebase uses X (see `file:line`). Industry best practice recommends Y because [reason]. Trade-off: [brief]."

## 3. Comparison Matrix

Include only when 3+ approaches — for 2, the pros/cons lists already cover it.

```
| Criteria            | Approach 1 | Approach 2 | Approach 3 |
|---------------------|------------|------------|------------|
| Complexity          |            |            |            |
| Risk                |            |            |            |
| Maintainability     |            |            |            |
| Testability         |            |            |            |
| Fits Codebase       |            |            |            |
| Pattern Commonality |            |            |            |
```

## 4. Recommendation

One or more approaches may be recommended. Use this format:

**Recommended:** Approach N [, Approach M] — [one sentence each on why].

- **Prefer Approach N when:** [conditions/context where N is the better choice]
- **Prefer Approach M when:** [conditions/context where M is the better choice]

Confidence: [level per project standards]
Assumptions: [anything that could change this recommendation]

If only one approach is clearly superior, skip the "Prefer ... when" lines and just state the recommendation.

## 5. Open Questions (if any)

Bullet list of questions that would help narrow down the best approach.
