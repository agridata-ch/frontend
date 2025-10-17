import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit } from '@fortawesome/pro-regular-svg-icons';

import { getTranslocoModule } from '@/app/transloco-testing.module';

import { ActionDTO, TableActionsComponent } from './table-actions.component';

describe('TableActionsComponent', () => {
  let fixture: ComponentFixture<TableActionsComponent>;
  let component: TableActionsComponent;
  let componentRef: ComponentRef<TableActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TableActionsComponent,
        FontAwesomeModule,
        getTranslocoModule({
          langs: {
            de: {},
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableActionsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly sort actions with main actions appearing after non-main actions', () => {
    const action1: ActionDTO = { label: 'B Action', callback: jest.fn(), isMainAction: false };
    const action2: ActionDTO = { label: 'A Action', callback: jest.fn(), isMainAction: true };
    const action3: ActionDTO = { label: 'C Action', callback: jest.fn(), isMainAction: false };

    componentRef.setInput('actions', [action1, action2, action3]);

    const sortedActions = component.sortedActions();

    expect(sortedActions[0].label).toBe('B Action');
    expect(sortedActions[1].label).toBe('C Action');
    expect(sortedActions[2].label).toBe('A Action');
  });

  it('should call the action callback when handleActionClick is triggered', () => {
    const mockCallback = jest.fn();
    const action: ActionDTO = {
      label: 'Test Action',
      callback: mockCallback,
      icon: faEdit,
    };

    component.handleActionClick(action);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should emit row action event when handleRowAction is called', () => {
    const rowActionSpy = jest.spyOn(component.rowAction, 'emit');

    component.handleRowAction();

    expect(rowActionSpy).toHaveBeenCalledTimes(1);
  });

  it('should disable the main action button if main action is disabled', () => {
    const mainAction: ActionDTO = {
      label: 'actions.accept',
      callback: jest.fn(),
      isMainAction: true,
      isDisabled: true,
    };

    componentRef.setInput('actions', [mainAction]);
    fixture.detectChanges();

    // Query the main action button
    const buttons = fixture.debugElement.queryAll(By.css('app-agridata-button'));
    const acceptButton = buttons.find((btn) =>
      btn.nativeElement.textContent.includes('actions.accept'),
    );

    expect(acceptButton).toBeTruthy();
    expect(acceptButton?.componentInstance?.disabled()).toBe(true);
  });
});
