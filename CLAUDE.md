# agridata.ch

Open-source zoneless Angular 20 application using signals and experimental
resources for API data retrieval.

## Framework & Patterns

- No RxJS - use signals or promises instead
- Use Angular 20 recommended techniques: effects, computed signals, resources
- Zoneless application - keep this in mind for change detection

## Type Safety

- Everything must be type safe
- No `any` type
- No casting to other types if avoidable

## Code Style

- Strive for simplicity and clean code
- Tailwind for styling, minimalistic styles only
- Imports ordered alphabetically

## Property Order in Classes

Arrange in this order - use a comment per category when many properties exist:

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

The skill will trigger automatically when you ask about unit tests, or you can explicitly reference it for guidance on any testing scenario.
