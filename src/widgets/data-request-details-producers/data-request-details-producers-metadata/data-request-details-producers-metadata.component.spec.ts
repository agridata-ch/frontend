import { provideHttpClient } from '@angular/common/http';
import { ComponentRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mocked } from 'vitest';

import { DataRequestService } from '@/entities/api';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockDataRequestService,
  createMockErrorHandlerService,
  MockDataRequestService,
  MockErrorHandlerService,
  mockConsentRequestStatusSummary,
} from '@/shared/testing/mocks';

import { DataRequestDetailsProducersMetadataComponent } from './data-request-details-producers-metadata.component';

describe('DataRequestDetailsProducersMetadataComponent', () => {
  let fixture: ComponentFixture<DataRequestDetailsProducersMetadataComponent>;
  let component: DataRequestDetailsProducersMetadataComponent;
  let componentRef: ComponentRef<DataRequestDetailsProducersMetadataComponent>;
  let mockI18nService: Mocked<I18nService>;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;

  const createComponent = () => {
    fixture = TestBed.createComponent(DataRequestDetailsProducersMetadataComponent);
    componentRef = fixture.componentRef;
    component = componentRef.instance;
    componentRef.setInput('dataRequestId', '1');
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mockI18nService = {
      translate: vi.fn((key: string) => key),
      useObjectTranslation: vi.fn(),
      lang: signal('de'),
    } as unknown as Mocked<I18nService>;
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsProducersMetadataComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        provideHttpClient(),
      ],
    }).compileComponents();

    createComponent();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('data loading', () => {
    it('should fetch the metadata for the given data request id', async () => {
      await fixture.whenStable();

      expect(dataRequestService.fetchProducersMetadata).toHaveBeenCalledWith('1');
    });

    it('should not fetch when no id is provided', async () => {
      dataRequestService.fetchProducersMetadata.mockClear();

      // Fresh fixture that keeps the default empty id.
      fixture = TestBed.createComponent(DataRequestDetailsProducersMetadataComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(dataRequestService.fetchProducersMetadata).not.toHaveBeenCalled();
    });

    it('should forward errors to the error handler', async () => {
      const error = new Error('boom');
      dataRequestService.fetchProducersMetadata.mockRejectedValue(error);

      createComponent();
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('columns', () => {
    it('should map each state to its UID and BUR counts with Swiss grouping', async () => {
      await fixture.whenStable();

      const columns = component['columns']();

      expect(columns.map((c) => c.labelKey)).toEqual(['total', 'open', 'granted', 'declined']);
      // 1562 -> "1'562": grouped, not the raw number (separator char varies by ICU build).
      expect(columns[0].uid).toMatch(/1.562/);
      expect(columns[0].uid).not.toBe('1562');
      expect(columns[0].bur).toMatch(/2.536/);
      expect(columns[2].uid).toBe('978');
    });
  });

  describe('BUR visibility', () => {
    it('should expose BUR when the summary has a bur block', async () => {
      await fixture.whenStable();

      expect(component['hasBur']()).toBe(true);
    });

    it('should hide BUR when the summary has no bur block', async () => {
      dataRequestService.fetchProducersMetadata.mockResolvedValue({
        uid: mockConsentRequestStatusSummary.uid,
      });

      createComponent();
      await fixture.whenStable();

      expect(component['hasBur']()).toBe(false);
    });
  });
});
