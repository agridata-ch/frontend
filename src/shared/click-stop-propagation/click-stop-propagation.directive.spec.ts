import { ClickStopPropagationDirective } from '@/shared/click-stop-propagation';

describe('ClickStopPropagationDirective', () => {
  let directive: ClickStopPropagationDirective;

  beforeEach(() => {
    directive = new ClickStopPropagationDirective();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should stop propagation on click', () => {
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    directive.onClick(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
