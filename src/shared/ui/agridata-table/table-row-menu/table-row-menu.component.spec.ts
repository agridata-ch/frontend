// typescript
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { faPenToSquare } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ButtonComponent } from '@/shared/ui/button';

import { ActionDTO, TableRowMenuComponent } from './table-row-menu.component';

describe('TableActionsComponent', () => {
  let fixture: ComponentFixture<TableRowMenuComponent>;
  let component: TableRowMenuComponent;
  let componentRef: ComponentRef<TableRowMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TableRowMenuComponent,
        FontAwesomeModule,
        createTranslocoTestingModule({
          langs: {
            de: {},
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRowMenuComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the menu when toggle button is clicked', () => {
    // Find all button components and click the first one (toggle)
    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    const toggleButton = buttons[0];
    expect(toggleButton).toBeDefined();

    toggleButton.triggerEventHandler('onClick', null);

    expect(component['isOpen']()).toBe(true);

    // Toggle again
    toggleButton.triggerEventHandler('onClick', null);
    expect(component['isOpen']()).toBe(false);
  });

  it('should call action callback and manage loading state when action button is clicked', async () => {
    // Create an action that resolves after a macrotask so we can assert loading state while pending
    const actionCallback = jest
      .fn()
      .mockImplementation(() => new Promise<void>((res) => setTimeout(res, 0)));

    const action: ActionDTO = {
      icon: faPenToSquare,
      label: 'test.action',
      callback: actionCallback,
    };

    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    const toggleButton = buttons[0];
    expect(toggleButton).toBeDefined();

    toggleButton.triggerEventHandler('onClick', null);

    componentRef.setInput('actions', [action]);
    fixture.detectChanges();
    await fixture.whenStable();
    // Find action button by searching ButtonComponent instances that contain our label
    const actionListElements = fixture.debugElement.queryAll(By.css('li'));
    const testActionElement = actionListElements.find((element) =>
      element.nativeElement.textContent?.includes('test.action'),
    );

    expect(testActionElement).toBeDefined();

    testActionElement!.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    fixture.detectChanges();
    // Callback should have been invoked
    expect(actionCallback).toHaveBeenCalled();

    // Immediately after click the loading signal should be true
    const actionWithLoading = component['actionWithLoadingSignal']()[0];
    expect(actionWithLoading.loading()).toBe(true);

    // Wait for the micro/macrotask to complete and detect changes
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();
    await fixture.whenStable();

    // After completion loading should be false and menu closed
    expect(actionWithLoading.loading()).toBe(false);
    expect(component['isOpen']()).toBe(false);
  });
});
