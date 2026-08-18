import { DebugElement, ResourceRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AnalyticsService } from '@/app/analytics.service';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import {
  ConsentRequestAggregationSummaryDto,
  ConsentRequestAggregationStateEnum,
  ConsentRequestStateEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  MockResources,
  createMockAgridataStateService,
  MockAgridataStateService,
  createMockAnalyticsService,
  createMockConsentRequestService,
  mockConsentRequestAggregations,
  MockConsentRequestService,
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService } from '@/shared/toast';
import { ButtonComponent } from '@/shared/ui/button';

import { ConsentRequestTableComponent } from './consent-request-table.component';

describe('ConsentRequestTableComponent', () => {
  let component: ConsentRequestTableComponent;
  let fixture: ComponentFixture<ConsentRequestTableComponent>;
  let mockToastService: jest.Mocked<ToastService>;
  let mockI18nService: jest.Mocked<I18nService>;
  let errorService: MockErrorHandlerService;
  let consentRequestService: MockConsentRequestService;
  let stateService: MockAgridataStateService;
  let mockResourceRef: ResourceRef<ConsentRequestAggregationSummaryDto[]>;

  beforeEach(async () => {
    mockToastService = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    mockI18nService = {
      translate: jest.fn(),
      useObjectTranslation: jest.fn(),
      lang: signal('de'),
    } as unknown as jest.Mocked<I18nService>;

    consentRequestService = createMockConsentRequestService();
    errorService = createMockErrorHandlerService();
    stateService = createMockAgridataStateService();
    mockResourceRef = MockResources.createMockResourceRef(mockConsentRequestAggregations);
    await TestBed.configureTestingModule({
      imports: [
        ConsentRequestTableComponent,
        createTranslocoTestingModule({
          langs: {
            de: {},
          },
        }),
      ],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: ConsentRequestService, useValue: consentRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: AnalyticsService, useValue: createMockAnalyticsService() },
        { provide: AgridataStateService, useValue: stateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('aggregationId', undefined);
    fixture.componentRef.setInput('consentRequestAggregations', mockConsentRequestAggregations);
    // Set the consentRequestAggregationsResource input to the fetchConsentRequests ResourceRef
    fixture.componentRef.setInput('consentRequestAggregationsResource', mockResourceRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include partially opened requests in the combined opened filter', () => {
    component.setStateCodeFilter(ConsentRequestAggregationStateEnum.Opened);

    // dr-4 is PARTIALLY_OPENED
    expect(component.filteredConsentRequestAggregations().map((request) => request.id)).toEqual([
      'dr-1',
      'dr-3',
      'dr-4',
    ]);
  });

  it('should filter consent requests by state', () => {
    component.setStateCodeFilter(ConsentRequestAggregationStateEnum.Granted);

    expect(component.filteredConsentRequestAggregations().map((request) => request.id)).toEqual([
      'dr-2',
    ]);

    component.setStateCodeFilter(null);

    expect(component.filteredConsentRequestAggregations()).toHaveLength(
      mockConsentRequestAggregations.length,
    );
  });

  it('should get correct badge variant for different states', () => {
    expect(component.getBadgeVariant(ConsentRequestAggregationStateEnum.Opened)).toBe('info');
    expect(component.getBadgeVariant(ConsentRequestAggregationStateEnum.Granted)).toBe('success');
    expect(component.getBadgeVariant(ConsentRequestAggregationStateEnum.Declined)).toBe('error');
    expect(component.getBadgeVariant(ConsentRequestAggregationStateEnum.PartiallyOpened)).toBe(
      'warning',
    );
    expect(component.getBadgeVariant(ConsentRequestAggregationStateEnum.PartiallyGranted)).toBe(
      'warning',
    );
  });

  it('should emit action when opening details', () => {
    const emitSpy = jest.spyOn(component.tableRowAction, 'emit');
    component.openDetails(mockConsentRequestAggregations[0]);

    expect(emitSpy).toHaveBeenCalledWith(mockConsentRequestAggregations[0]);
  });

  it('should update consent request state', async () => {
    await component.updateConsentRequestState(
      mockConsentRequestAggregations[0],
      ConsentRequestStateEnum.Granted,
      'Test Request',
    );

    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['1'],
      ConsentRequestStateEnum.Granted,
    );
    expect(mockToastService.show).toHaveBeenCalled();
  });

  it('should update every consent request of an opened aggregation', async () => {
    await component.updateConsentRequestState(
      mockConsentRequestAggregations[2],
      ConsentRequestStateEnum.Granted,
      'Test Request',
    );

    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['4', '5'],
      ConsentRequestStateEnum.Granted,
    );
  });

  it('should only update the undecided consent requests of a partially opened aggregation', async () => {
    await component.updateConsentRequestState(
      mockConsentRequestAggregations[3],
      ConsentRequestStateEnum.Granted,
      'Test Request',
    );

    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['8'],
      ConsentRequestStateEnum.Granted,
    );
  });

  it('should only undo the consent requests it decided in a partially opened aggregation', async () => {
    await component.updateConsentRequestState(
      mockConsentRequestAggregations[3],
      ConsentRequestStateEnum.Granted,
      'Test Request',
    );

    const undoAction = mockToastService.show.mock.calls[0][3];
    undoAction?.callback();

    // '6' and '7' were already decided before, only '8' goes back to OPENED
    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenLastCalledWith(
      ['8'],
      ConsentRequestStateEnum.Opened,
    );
  });

  it('should only show consent action for open requests', async () => {
    jest.spyOn(mockI18nService, 'translate').mockImplementation((key: string) => key);

    fixture.detectChanges();
    await fixture.whenStable();
    const rows = fixture.debugElement.queryAll(By.css('tr'));
    const rowsWithState = (stateCode: ConsentRequestAggregationStateEnum) =>
      rows.filter((row) =>
        row.nativeElement.textContent?.includes(
          `consent-request.dataRequest.stateCode.${stateCode}`,
        ),
      );
    const countAcceptButtons = (row: DebugElement) =>
      row
        .queryAll(By.directive(ButtonComponent))
        .filter((button) =>
          button.nativeElement.textContent.includes('consent-request.table.tableActions.consent'),
        ).length;

    // opened and partially opened rows are actionable
    const openedRows = rowsWithState(ConsentRequestAggregationStateEnum.Opened);
    expect(openedRows).toHaveLength(2);
    expect(openedRows.map(countAcceptButtons)).toEqual([1, 1]);

    const partiallyOpenedRows = rowsWithState(ConsentRequestAggregationStateEnum.PartiallyOpened);
    expect(partiallyOpenedRows).toHaveLength(1);
    expect(countAcceptButtons(partiallyOpenedRows[0])).toBe(1);

    // check no accept button on granted request
    const grantedRows = rowsWithState(ConsentRequestAggregationStateEnum.Granted);
    expect(countAcceptButtons(grantedRows[0])).toBe(0);
  });

  it('should translate object correctly', () => {
    const translationDto = { de: 'Test', en: 'Test' };
    const i18nServiceSpy = jest.spyOn(mockI18nService, 'useObjectTranslation');

    component.getTranslation(translationDto);

    expect(i18nServiceSpy).toHaveBeenCalledWith(translationDto);
  });

  it('should handle undefined translation object', () => {
    expect(component.getTranslation(undefined)).toBe('');
  });

  it('should prepare undo action correctly', async () => {
    const undoAction = component.prepareUndoAction(['2', '3']);

    expect(undoAction).toBeDefined();

    // Call the callback and make sure it restores the previous states
    undoAction?.callback();

    // Wait for the promise chain to complete
    await Promise.resolve();
    await Promise.resolve();

    // Check the expected method calls
    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['2', '3'],
      ConsentRequestStateEnum.Opened,
    );
    expect(mockResourceRef.reload).toHaveBeenCalled();
  });

  it('should handle error on consent request update', async () => {
    const error = {
      error: {
        message: 'Error message',
        requestId: '123',
      },
    };
    consentRequestService.updateConsentRequestStatuses = jest.fn().mockRejectedValue(error);
    mockI18nService.translate.mockReturnValue('Translated error message');

    await component.updateConsentRequestState(
      mockConsentRequestAggregations[0],
      ConsentRequestStateEnum.Granted,
      'Test Request',
    );
    fixture.detectChanges();
    await Promise.resolve();

    expect(errorService.handleError).toHaveBeenCalled();
  });

  it('should get translated state value', () => {
    const i18nServiceSpy = jest.spyOn(mockI18nService, 'translate');

    component.getTranslatedStateValue(ConsentRequestAggregationStateEnum.Opened);

    expect(i18nServiceSpy).toHaveBeenCalledWith('consent-request.dataRequest.stateCode.OPENED');
  });

  it('should handle undefined state value', () => {
    expect(component.getTranslatedStateValue(undefined)).toBe('');
  });

  it('should execute action callback correctly', () => {
    component.updateConsentRequestState(
      mockConsentRequestAggregations[0],
      ConsentRequestStateEnum.Declined,
      'Test Request',
    );

    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['1'],
      ConsentRequestStateEnum.Declined,
    );
  });

  describe('highlightClickedRowFn', () => {
    const getHighlightClickedRowFn = () =>
      component['consentRequestsTableMetaData']().highlightClickedRowFn;

    it('should not highlight any row when aggregationId is undefined', () => {
      expect(getHighlightClickedRowFn()?.(mockConsentRequestAggregations[0])).toBe(false);
      expect(getHighlightClickedRowFn()?.(mockConsentRequestAggregations[1])).toBe(false);
    });

    it('should highlight the aggregation matching the routed aggregation id', () => {
      fixture.componentRef.setInput('aggregationId', 'dr-1');
      fixture.detectChanges();
      expect(getHighlightClickedRowFn()?.(mockConsentRequestAggregations[0])).toBe(true);

      fixture.componentRef.setInput('aggregationId', 'dr-2');
      fixture.detectChanges();
      expect(getHighlightClickedRowFn()?.(mockConsentRequestAggregations[0])).toBe(false);
      expect(getHighlightClickedRowFn()?.(mockConsentRequestAggregations[1])).toBe(true);
    });

    it('should clear highlighted row when aggregationId is set to undefined', () => {
      fixture.componentRef.setInput('aggregationId', 'dr-1');
      fixture.detectChanges();
      expect(getHighlightClickedRowFn()?.(mockConsentRequestAggregations[0])).toBe(true);

      fixture.componentRef.setInput('aggregationId', undefined);
      fixture.detectChanges();
      expect(getHighlightClickedRowFn()?.(mockConsentRequestAggregations[0])).toBe(false);
    });
  });
});
