import { TestBed } from '@angular/core/testing';
import { DriveStep } from 'driver.js';

import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks/mock-i18n-service';

import { ProductTourService } from './product-tour.service';

const mockDrive = jest.fn();
const mockDriverInstance = { drive: mockDrive };
const mockDriver = jest.fn().mockReturnValue(mockDriverInstance);

jest.mock('driver.js', () => ({
  driver: (...args: unknown[]) => mockDriver(...args),
}));

const mockSteps: DriveStep[] = [
  { element: '#step-1', popover: { title: 'Step 1', description: 'Desc 1' } },
  { element: '#step-2', popover: { title: 'Step 2', description: 'Desc 2' } },
];

describe('ProductTourService', () => {
  let service: ProductTourService;
  let i18nService: MockI18nService;

  beforeEach(() => {
    mockDriver.mockClear();
    mockDrive.mockClear();

    i18nService = createMockI18nService();

    TestBed.configureTestingModule({
      providers: [ProductTourService, { provide: I18nService, useValue: i18nService }],
    });

    service = TestBed.inject(ProductTourService);
  });

  it('should start with isActive as false', () => {
    expect(service.isActive()).toBe(false);
  });

  describe('start()', () => {
    it('should set isActive to true and call drive()', () => {
      service.start(mockSteps);

      expect(service.isActive()).toBe(true);
      expect(mockDrive).toHaveBeenCalled();
    });

    it('should pass steps and default config to driver()', () => {
      service.start(mockSteps);

      const config = mockDriver.mock.calls[0][0];
      expect(config.steps).toBe(mockSteps);
      expect(config.animate).toBe(true);
      expect(config.smoothScroll).toBe(true);
      expect(config.showProgress).toBe(true);
      expect(config.popoverClass).toBe('driver-product-tour-theme');
    });

    it('should use translated next and done button texts', () => {
      service.start(mockSteps);

      expect(i18nService.translate).toHaveBeenCalledWith('product-tour.nextBtnText');
      expect(i18nService.translate).toHaveBeenCalledWith('product-tour.doneBtnText');
    });

    it('should set isActive to false when onDestroyed fires', () => {
      service.start(mockSteps);
      expect(service.isActive()).toBe(true);

      const config = mockDriver.mock.calls[0][0];
      config.onDestroyed(null, null, {});

      expect(service.isActive()).toBe(false);
    });

    it('should call caller onDestroyed when provided', () => {
      const onDestroyed = jest.fn();
      service.start(mockSteps, { onDestroyed });

      const config = mockDriver.mock.calls[0][0];
      config.onDestroyed(null, null, {});

      expect(onDestroyed).toHaveBeenCalledWith(null, null, {});
    });

    it('should update progress text in onPopoverRender', () => {
      service.start(mockSteps);

      const progressEl = document.createElement('span');
      progressEl.className = 'driver-popover-progress-text';
      const wrapper = document.createElement('div');
      wrapper.appendChild(progressEl);

      const popover = { wrapper } as unknown as Parameters<
        NonNullable<Parameters<typeof mockDriver>[0]['onPopoverRender']>
      >[0];
      const options = { state: { activeIndex: 0 } } as unknown as Parameters<
        NonNullable<Parameters<typeof mockDriver>[0]['onPopoverRender']>
      >[1];

      const config = mockDriver.mock.calls[0][0];
      config.onPopoverRender(popover, options);

      expect(i18nService.translate).toHaveBeenCalledWith('product-tour.progressText', {
        current: 1,
        total: 2,
      });
    });

    it('should call caller onPopoverRender when provided', () => {
      const onPopoverRender = jest.fn();
      service.start(mockSteps, { onPopoverRender });

      const wrapper = document.createElement('div');
      const popover = { wrapper } as unknown as Parameters<
        NonNullable<Parameters<typeof mockDriver>[0]['onPopoverRender']>
      >[0];
      const options = { state: { activeIndex: 1 } } as unknown as Parameters<
        NonNullable<Parameters<typeof mockDriver>[0]['onPopoverRender']>
      >[1];

      const config = mockDriver.mock.calls[0][0];
      config.onPopoverRender(popover, options);

      expect(onPopoverRender).toHaveBeenCalledWith(popover, options);
    });

    it('should spread additional config onto driver config', () => {
      service.start(mockSteps, { popoverOffset: 99 });

      const config = mockDriver.mock.calls[0][0];
      expect(config.popoverOffset).toBe(99);
    });
  });

  describe('stop()', () => {
    it('should set isActive to false', () => {
      service.start(mockSteps);
      expect(service.isActive()).toBe(true);

      service.stop();
      expect(service.isActive()).toBe(false);
    });
  });
});
