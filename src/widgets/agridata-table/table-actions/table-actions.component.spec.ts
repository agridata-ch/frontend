import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TableActionsComponent, ActionDTO } from './table-actions.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('TableActionsComponent', () => {
  let fixture: ComponentFixture<TableActionsComponent>;
  let component: TableActionsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableActionsComponent, FontAwesomeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('mainAction computed', () => {
    it('should return the action marked as mainAction', () => {
      const actions: ActionDTO[] = [
        { label: 'First', callback: () => {}, isMainAction: false },
        { label: 'Main', callback: () => {}, isMainAction: true },
        { label: 'Other', callback: () => {}, isMainAction: false },
      ];
      component.actions = actions;
      expect(component.mainAction()).toEqual(actions[1]);
    });

    it('should return undefined if no mainAction is marked', () => {
      const actions: ActionDTO[] = [
        { label: 'A', callback: () => {} },
        { label: 'B', callback: () => {} },
      ];
      component.actions = actions;
      expect(component.mainAction()).toBeUndefined();
    });
  });

  describe('toggle and click handlers', () => {
    it('handleToggle should open and close the menu', () => {
      expect(component.isOpen()).toBeFalsy();
      component.handleToggle();
      expect(component.isOpen()).toBeTruthy();
      component.handleToggle();
      expect(component.isOpen()).toBeFalsy();
    });

    it('handleClick should call callback and close menu', () => {
      const spy = jest.fn();
      const action: ActionDTO = { label: 'Act', callback: spy };

      component.isOpen.set(true);
      component.handleClick(action);

      expect(spy).toHaveBeenCalled();
      expect(component.isOpen()).toBeFalsy();
    });
  });

  describe('click outside behavior', () => {
    it('should close the menu when clicking outside', () => {
      component.isOpen.set(true);
      const outside = document.createElement('div');
      component.onClickOutside(outside);
      expect(component.isOpen()).toBeFalsy();
    });

    it('should not close when clicking inside host element', () => {
      component.isOpen.set(true);
      const hostElement: HTMLElement = fixture.nativeElement;
      component.onClickOutside(hostElement);
      expect(component.isOpen()).toBeTruthy();
    });
  });
});
