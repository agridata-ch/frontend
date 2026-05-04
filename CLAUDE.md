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

### General

- Focus on high-complexity features - not too many tests
- Test component behavior, not implementation details
- No need to mock child components
- No style-related tests
- Jest for mocking and spies

### Test Setup

Add these constants in the describe block:

```typescript
let component: MyComponent;
let componentRef: ComponentRef<MyComponent> = fixture.componentRef;
// component = fixture.componentInstance
```

Use `component` instead of `fixture.componentInstance` wherever possible.

### Signals & Inputs

```typescript
componentRef.setInput('fieldname', fieldValue);
```

### Protected Access

```typescript
component['protectedProperty'];
// never access private properties
```

### Finding DOM Elements

Prefer aria-labels or translation keys over CSS selectors.

### Button Click Simulation (AgriData ButtonComponent)

```typescript
const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
const matchingButton = buttons.find((btn) =>
  btn.query(By.css('[aria-label="common.ariaLabel.close"]')),
);
matchingButton?.triggerEventHandler('buttonClicked', null);
```

### Service Mocks

All services have mocks with a `mock` prefix. Import pattern:

```typescript
import { createMockMyService, MockMyService } from '@/shared/testing/mocks/mock-my-service';
```

Declare in describe block:

```typescript
let myService: MockMyService;
```

Assign in beforeEach:

```typescript
myService = createMockMyService();
```

Override mock functions:

```typescript
myService.someMethod.mockReturnValue(true);
myService.__testSignals.someSignal.set('new value');
```

### Testing Resources

To test a resource, override the loader service function and create a fresh fixture:

```typescript
it('should handle errors from myResource', async () => {
  const testError = new Error('Test error');
  myService.fetchData.mockRejectedValueOnce(testError);

  const errorFixture = TestBed.createComponent(MyComponent);
  errorFixture.detectChanges();
  await errorFixture.whenStable();

  expect(errorService.handleError).toHaveBeenCalledWith(testError);
});
```

### Transloco

Always include in TestBed:

```typescript
getTranslocoModule({
  langs: { de: {} },
}),
```

### Running Tests

```bash
npm run test:unit -- test.spec.ts
```
