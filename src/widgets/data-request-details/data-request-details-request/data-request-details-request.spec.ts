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
      burPresent: false,
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
        burPresent: false,
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
        burPresent: false,
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

    it('should copy the invitation link with the invitation link messages', async () => {
      const icon = fixture.nativeElement.querySelector('[data-testid="copy-invitation-link"]');
      icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await vi.runAllTimersAsync();

      expect(writeText).toHaveBeenCalledWith(component['invitationLink']());
      expect(component['copyFeedback'].message()).toBe('data-request.invitationLink.copied');
    });
  });
});
