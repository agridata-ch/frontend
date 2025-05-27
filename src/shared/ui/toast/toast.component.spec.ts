import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService, ToastType, ToastState, Toast } from '@shared/services/toast.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: { toasts: jest.Mock; dismiss: jest.Mock };

  const mockToasts: Toast[] = [
    {
      id: 1,
      title: 'Success',
      message: 'It worked!',
      type: ToastType.Success,
      state: ToastState.Enter,
    },
    {
      id: 2,
      title: 'Error',
      message: 'It failed!',
      type: ToastType.Error,
      state: ToastState.Enter,
    },
    { id: 3, title: 'Info', message: 'FYI', type: ToastType.Info, state: ToastState.Enter },
    {
      id: 4,
      title: 'Warning',
      message: 'Careful!',
      type: ToastType.Warning,
      state: ToastState.Enter,
    },
  ];

  beforeEach(async () => {
    toastService = {
      toasts: jest.fn(() => mockToasts),
      dismiss: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ToastComponent, CommonModule, FontAwesomeModule],
      providers: [{ provide: ToastService, useValue: toastService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose ToastType and ToastState', () => {
    expect(component.ToastType).toBe(ToastType);
    expect(component.ToastState).toBe(ToastState);
  });

  it('should return correct classes for each toast type', () => {
    expect(component.getToastClasses(mockToasts[0])).toBe('bg-green-100 text-green-800');
    expect(component.getToastClasses(mockToasts[1])).toBe('bg-red-100 text-red-700');
    expect(component.getToastClasses(mockToasts[2])).toBe('bg-blue-100 text-blue-800');
    expect(component.getToastClasses(mockToasts[3])).toBe('bg-yellow-100 text-yellow-800');
  });

  it('should call toastService.dismiss when dismiss is called', () => {
    component.dismiss(1);
    expect(toastService.dismiss).toHaveBeenCalledWith(1);
  });

  it('should auto-dismiss the newest toast after 7 seconds', () => {
    jest.useFakeTimers();
    // Re-create component to trigger effect
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    jest.advanceTimersByTime(7000);
    expect(toastService.dismiss).toHaveBeenCalledWith(mockToasts[0].id);
    jest.useRealTimers();
  });
});
