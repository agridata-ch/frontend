import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';
import { TooltipBubbleService } from '@/shared/tooltip';

import { DataRequestDetailsRequestComponent } from './data-request-details-request.component';

describe('DataRequestDetailsRequestComponent', () => {
  let fixture: ComponentFixture<DataRequestDetailsRequestComponent>;
  let component: DataRequestDetailsRequestComponent;
  let componentRef: ComponentRef<DataRequestDetailsRequestComponent>;
  let showTransient: Mock;

  beforeEach(async () => {
    showTransient = vi.fn();

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsRequestComponent],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: TooltipBubbleService, useValue: { show: vi.fn(), showTransient } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestDetailsRequestComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set required input before detectChanges
    componentRef.setInput('dataRequest', {
      id: 'test-id',
      dataProviderId: 'test-provider',
      submissionDate: '2026-01-09T10:00:00Z',
      stateCode: DataRequestStateEnum.Draft,
      advantages: [],
    } as DataRequestDto);

    fixture.detectChanges();
  });

  describe('computed signals', () => {
    it('should compute formattedSubmissionDate correctly', () => {
      componentRef.setInput('dataRequest', {
        id: 'test-id',
        dataProviderId: 'test-provider',
        submissionDate: '2026-01-09T10:00:00Z',
        stateCode: DataRequestStateEnum.Draft,
        advantages: [],
      } as DataRequestDto);
      fixture.detectChanges();

      expect(component['formattedSubmissionDate']()).toBeDefined();
      expect(component['formattedSubmissionDate']()).toContain('09.01.2026');
    });
  });

  describe('handleCopy', () => {
    let writeText: Mock;

    beforeEach(() => {
      vi.useFakeTimers();
      writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });

      componentRef.setInput('dataRequest', {
        id: 'test-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.Active,
        advantages: [],
      } as DataRequestDto);
      fixture.detectChanges();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function copy() {
      const event = new MouseEvent('click', { clientX: 500, clientY: 300, detail: 1 });
      return component['handleCopy'](event, document.createElement('button'));
    }

    it('should copy the invitation link when the copy icon is clicked', () => {
      const icon = fixture.nativeElement.querySelector('[data-testid="copy-invitation-link"]');
      icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(writeText).toHaveBeenCalledWith(component['invitationLink']());
    });

    it('should show a bubble at the cursor after a successful copy', async () => {
      await copy();

      expect(component['copyFeedbackKey']()).toBe('invitationLink.copied');
      expect(showTransient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        1500,
        expect.any(Function),
      );
      expect(showTransient.mock.calls[0][1]()).toEqual({
        top: 300,
        bottom: 300,
        left: 500,
        width: 0,
        height: 0,
      });
    });

    it('should anchor the bubble to the button when activated by keyboard', async () => {
      const event = new MouseEvent('click', { detail: 0 });
      const button = document.createElement('button');

      await component['handleCopy'](event, button);

      expect(showTransient.mock.calls[0][1]()).toEqual(button.getBoundingClientRect());
    });

    it('should show the failure feedback when the clipboard write rejects', async () => {
      writeText.mockRejectedValue(new Error('permission denied'));

      await copy();

      expect(component['copyFeedbackKey']()).toBe('invitationLink.copyFailed');
    });

    it('should clear the live region when the bubble hides', async () => {
      await copy();
      expect(component['copyFeedbackKey']()).toBe('invitationLink.copied');

      // The service owns the timer, so replay the onHide it was handed.
      showTransient.mock.calls[0][3]();

      expect(component['copyFeedbackKey']()).toBe('');
    });
  });

  describe('getStatusTranslation', () => {
    it('should return translated status for valid stateCode', () => {
      const result = component['getStatusTranslation'](DataRequestStateEnum.Draft);
      expect(result).toBeDefined();
    });

    it('should return empty string for undefined stateCode', () => {
      const result = component['getStatusTranslation']();
      expect(result).toBe('');
    });
  });
});
