import { ToastService, ToastState, ToastType } from '@/shared/toast';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new ToastService();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should start with an empty toast list', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('show() should add a new toast with correct properties and return its id', () => {
    const returnedId = service.show('Test Title', 'Test Message', ToastType.Success);
    const toasts = service.toasts();
    expect(returnedId).toBe(1);

    expect(toasts.length).toBe(1);
    const toast = toasts[0];
    expect(toast.id).toBe(1);
    expect(toast.title).toBe('Test Title');
    expect(toast.message).toBe('Test Message');
    expect(toast.type).toBe(ToastType.Success);
    expect(toast.state).toBe(ToastState.Enter);

    // Adding a second toast increments the id and prepends to the list
    const secondId = service.show('Another', 'Msg', ToastType.Warning);
    const updated = service.toasts();
    expect(secondId).toBe(2);
    expect(updated.length).toBe(2);
    expect(updated[0].id).toBe(2);
    expect(updated[1].id).toBe(1);
  });

  it('dismiss() should set toast state to Exit and remove it after 200ms', () => {
    const id = service.show('Dismiss Test', 'Will dismiss shortly', ToastType.Info);
    let toasts = service.toasts();
    expect(toasts[0].state).toBe(ToastState.Enter);

    service.dismiss(id);

    toasts = service.toasts();
    expect(toasts.length).toBe(0);
  });

  it('clear() should remove all toasts immediately', () => {
    service.show('One', 'Msg1', ToastType.Info);
    service.show('Two', 'Msg2', ToastType.Error);
    expect(service.toasts().length).toBe(2);

    service.clear();
    expect(service.toasts()).toEqual([]);
  });
});
