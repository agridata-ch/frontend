---
name: unit-tests-agridata
description: Create and maintain unit tests for agridata Angular components and services. Use this skill whenever the user wants to write new tests, improve existing test coverage, refactor tests to follow patterns, or needs guidance on testing Angular signals, mocks, resources, or component behavior. Works for both generating test files from scratch and enhancing existing .spec.ts files. Also use when the user shows you failing tests or asks "how should I test this?".
compatibility: Jest, Angular 20+, TypeScript
---

# Unit Tests for Agridata

This skill helps you write and maintain unit tests for the agridata project. It guides you through Jest setup, component testing with signals, mocking services, and testing async resources—all aligned with the project's testing patterns.

## When to Use This Skill

- **Writing new tests**: Creating a .spec.ts file for a new component or service
- **Improving test coverage**: Adding tests to components with gaps
- **Refactoring tests**: Updating existing tests to match patterns (mocks, resource testing, etc.)
- **Debugging tests**: Understanding why a test is failing or how to test a specific scenario
- **Guidance on patterns**: "How do I test X?" when X is signals, resources, mocks, async behavior, DOM querying, etc.

## Core Testing Principles

Follow these principles (not rules—they reflect why testing matters):

### Focus on Behavior, Not Implementation

Test what the component or service _does_ from the user's perspective, not how it does it. This means:

- Test user interactions (button clicks, form input) not internal state changes
- Verify DOM output and user feedback, not component properties
- Don't mock child components—they're part of the contract the component depends on

**Why:** Implementation details change. Behavioral tests remain valid as you refactor.

### Use Shallow Mocking

Mock only what's necessary:

- Mock external services (API clients, state managers)
- Don't mock child components
- Don't mock Angular framework internals

**Why:** Over-mocking creates brittle tests that pass locally but fail in integration. Under-mocking slows tests down but catches real issues.

### Skip Style Testing

Never test CSS or visual layout:

- No assertions on `getComputedStyle`
- No checks for class names as a proxy for styling
- No snapshot tests of HTML

**Why:** Styling is visual—human eyes judge it better. Tests for "did the class apply" create false confidence.

---

## Test Setup Pattern

Every test file starts with this structure:

```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let componentRef: ComponentRef<MyComponent> = fixture.componentRef;
  // component = fixture.componentInstance

  // Add other variables here
  // 1. Injects (services)
  // 2. Mocks
  // 3. Test data

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent, ...],
      providers: [...],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Tests here
});
```

**Key patterns:**

- `component` is an alias for `fixture.componentInstance` — use it everywhere
- `fixture` is the ComponentFixture
- Call `fixture.detectChanges()` after creating the fixture and after any state change that should trigger change detection
- For zoneless applications: change detection is automatic on signal mutations, but explicit `detectChanges()` is still needed after TestBed setup

---

## Testing Signals & Inputs

### Setting Input Properties

Use `componentRef.setInput()` to set signal-based @Input properties:

```typescript
it('should update when input changes', () => {
  componentRef.setInput('username', 'alice');
  fixture.detectChanges();

  expect(component['usernameDisplay']).toContain('alice');
});
```

### Testing Computed Signals

Computed signals update automatically. Just set the inputs they depend on:

```typescript
it('should compute the full name', () => {
  componentRef.setInput('firstName', 'Alice');
  componentRef.setInput('lastName', 'Smith');
  fixture.detectChanges();

  expect(component['fullName']()).toBe('Alice Smith');
});
```

### Testing Effects

Effects run on signal changes. Use `fixture.whenStable()` to wait for them:

```typescript
it('should log when count changes', async () => {
  const logSpy = jest.spyOn(console, 'log');
  componentRef.setInput('count', 5);
  fixture.detectChanges();
  await fixture.whenStable();

  expect(logSpy).toHaveBeenCalledWith('count is 5');
});
```

---

## Accessing Component Properties in Tests

### Protected Properties (Use These)

Components expose `protected` properties for testing the template contract. Access them with bracket notation:

```typescript
it('should show the user name', () => {
  component['userName'].set('bob');
  fixture.detectChanges();

  expect(component['userNameDisplay']).toBe('bob');
});
```

### Private Properties (Avoid)

Don't access private properties—they're implementation details:

```typescript
// Bad
component['internalCounter'];

// Good — test the public/protected output instead
expect(component['displayValue']).toBe('...');
```

---

## HTML & DOM Testing

### General Rule: Don't Test HTML

**Skip DOM assertions unless absolutely necessary.** HTML is rendered by Angular's template system, which has its own extensive test coverage. Testing that an element exists or has the correct class is fragile and doesn't validate behavior.

**When NOT to query the DOM:**

- ✗ Checking that elements are rendered ("page title exists")
- ✗ Verifying CSS classes applied by the template
- ✗ Asserting on element visibility (display, hidden)
- ✗ Snapshot tests of HTML output

**Example: Don't do this**

```typescript
// Bad — tests the template, not the component logic
it('should render the page title', () => {
  const title = fixture.debugElement.query(By.css('h2.page-title'));
  expect(title).toBeTruthy();
});
```

### When to Query the DOM (Rare)

Only test DOM interactions when the HTML _behavior_ is core to testing the component logic:

1. **Directives** — Test that a directive applies validation or state to an element
2. **Event handlers** — Test that button clicks or form inputs trigger component methods
3. **Accessibility guards** — Test that critical elements have required aria attributes or directives

**Example: Do this for directive testing**

```typescript
it('should apply the DataProductDtoGuard directive to template context', () => {
  const guardedElement = fixture.debugElement.query(By.directive(DataProductDtoDirective));
  expect(guardedElement).toBeTruthy();
});
```

**Example: Do this for event handling**

```typescript
it('should handle button clicks and call save', () => {
  const saveButton = fixture.debugElement.query(By.directive(ButtonComponent));
  saveButton?.triggerEventHandler('buttonClicked', null);
  fixture.detectChanges();

  expect(component['onSaveClicked']).toHaveBeenCalled();
});
```

### Finding DOM Elements (When Necessary)

Use aria-labels or directives instead of CSS selectors to reduce fragility:

```typescript
// Good — targets by accessibility directive
const guardedElement = fixture.debugElement.query(By.directive(DataProductDtoDirective));

// Acceptable — aria-labels indicate accessible element
const saveButton = fixture.debugElement.query(By.css('[aria-label="common.ariaLabel.save"]'));

// Avoid — brittle, depends on CSS classes
const saveButton = fixture.debugElement.query(By.css('.save-button'));
```

---

## Mocking Services

### Service Mock Pattern

All agridata services have mocks with a `mock` prefix:

```typescript
import { createMockUserService, MockUserService } from '@/shared/testing/mocks';

describe('MyComponent', () => {
  let userService: MockUserService;

  beforeEach(async () => {
    userService = createMockUserService();

    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [{ provide: UserService, useValue: userService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });
});
```

### Overriding Mock Methods

Mock methods are Jest spies. Override them per-test:

```typescript
it('should display user name', () => {
  userService.getUser.mockReturnValue({
    id: '1',
    name: 'Alice',
  });

  fixture.detectChanges();

  expect(component['displayedName']).toBe('Alice');
});

it('should handle errors', () => {
  userService.getUser.mockRejectedValueOnce(new Error('Network error'));

  fixture.detectChanges();

  expect(component['errorMessage']).toContain('Network error');
});
```

### Overriding Mock Signals

Mocks expose `__testSignals` for testing signal-based state:

```typescript
it('should react to service signal changes', async () => {
  userService.__testSignals.currentUser.set({
    id: '1',
    name: 'Charlie',
  });
  fixture.detectChanges();
  await fixture.whenStable();

  expect(component['userDisplay']).toBe('Charlie');
});
```

---

## Testing Resources

Resources are async data loaders. Test them by overriding the underlying service and creating a fresh fixture:

```typescript
it('should load user data on init', async () => {
  const testUser = { id: '1', name: 'Diana' };
  userService.fetchUser.mockResolvedValueOnce(testUser);

  const testFixture = TestBed.createComponent(MyComponent);
  testFixture.detectChanges();
  await testFixture.whenStable();

  const component = testFixture.componentInstance;
  expect(component['user']()).toEqual(testUser);
});

it('should handle resource errors', async () => {
  const testError = new Error('API failed');
  userService.fetchUser.mockRejectedValueOnce(testError);

  const testFixture = TestBed.createComponent(MyComponent);
  testFixture.detectChanges();
  await testFixture.whenStable();

  const component = testFixture.componentInstance;
  expect(component['error']()).toEqual(testError);
});
```

**Why a fresh fixture:** Resources often load on component init. Creating a new fixture ensures the resource runs in a clean state with your mocked data.

---

## i18n (Transloco)

Always include Transloco in the TestBed:

```typescript
import { getTranslocoModule } from '@/shared/testing/transloco.spec';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [
      MyComponent,
      getTranslocoModule({
        langs: { de: {} },
      }),
    ],
  }).compileComponents();
});
```

This loads the translation module with an empty German dictionary. Tests don't need real translations—just the module structure.

---

## Running Tests

Run a single test file:

```bash
npm run test:unit -- test.spec.ts
```

Run tests matching a pattern:

```bash
npm run test:unit -- --testNamePattern="should display"
```

Run in watch mode:

```bash
npm run test:unit -- --watch
```

---

## Test Organization

Organize tests by user-facing behavior, not internal structure:

```typescript
describe('UserProfileComponent', () => {
  describe('display', () => {
    it('should show the user name');
    it('should show the avatar');
  });

  describe('editing', () => {
    it('should allow editing the bio');
    it('should save changes to the API');
  });

  describe('errors', () => {
    it('should show an error if save fails');
  });
});
```

---

## Common Patterns

### Testing Async Operations

```typescript
it('should fetch data and display it', async () => {
  userService.fetchUser.mockResolvedValueOnce({ name: 'Eve' });

  fixture.detectChanges();
  await fixture.whenStable();

  expect(component['userName']()).toBe('Eve');
});
```

### Spying on Calls

```typescript
it('should call the API when saving', () => {
  component['save']();

  expect(userService.updateUser).toHaveBeenCalledWith({
    id: '1',
    name: 'Frank',
  });
});
```

### Testing Multiple Scenarios with Parameters

```typescript
it.each([
  ['valid', { name: 'valid' }, true],
  ['empty', { name: '' }, false],
  ['too long', { name: 'x'.repeat(100) }, false],
])('should validate %s input', (label, input, expected) => {
  const result = component['validateInput'](input);
  expect(result).toBe(expected);
});
```

---

## What NOT to Test

- **HTML & DOM Rendering**: Don't test that elements exist, are visible, or have CSS classes (unless testing directives or event handlers)
- **CSS/Styling**: Don't assert on computed styles or class names
- **Child Components**: Don't test that child components render—they handle their own tests
- **Framework Internals**: Don't test Angular's ChangeDetectionStrategy, OnInit lifecycle, etc.
- **Third-Party Libraries**: Don't test that Angular or Jest work—assume they do

---

## Checklist for New Tests

- [ ] Test behavior, not implementation details
- [ ] Use `component` alias, not `fixture.componentInstance`
- [ ] Set signals via `componentRef.setInput()`
- [ ] Wait for async with `fixture.whenStable()`
- [ ] Mock external services, not child components
- [ ] Include Transloco in TestBed if the component uses i18n
- [ ] **Skip DOM assertions** unless testing directives or event handlers
- [ ] Avoid testing HTML, CSS, child components, or framework internals
- [ ] Organize tests by user-facing behavior
