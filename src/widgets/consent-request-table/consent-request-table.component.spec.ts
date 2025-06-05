import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestService } from '@/entities/api/consent-request.service';
import { ConsentRequestDto, ConsentRequestStateEnum } from '@/entities/openapi';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataTableData } from '@/shared/ui/agridata-table';
import { BadgeVariant } from '@/shared/ui/badge';

import { ConsentRequestTableComponent } from './consent-request-table.component';

describe('ConsentRequestTableComponent', () => {
  let fixture: ComponentFixture<ConsentRequestTableComponent>;
  let component: ConsentRequestTableComponent;
  let componentRef: ComponentRef<ConsentRequestTableComponent>;

  let mockConsentService: {
    updateConsentRequestStatus: jest.Mock<Promise<void>, [string, string]>;
  };
  let mockToastService: {
    show: jest.Mock<void, [string, string, ToastType]>;
  };
  let reloadSpy: jest.Mock<void, []>;
  let rowActionSpy: jest.Mock<void, [ConsentRequestDto]>;

  const sampleRequests: ConsentRequestDto[] = [
    {
      id: '1',
      stateCode: ConsentRequestStateEnum.Opened,
      requestDate: '2025-01-01',
      dataRequest: { dataConsumer: { name: 'Alice' }, titleDe: 'Antrag A' },
    } as ConsentRequestDto,
    {
      id: '2',
      stateCode: ConsentRequestStateEnum.Granted,
      requestDate: '2025-02-01',
      dataRequest: { dataConsumer: { name: 'Bob' }, titleDe: 'Antrag B' },
    } as ConsentRequestDto,
    {
      id: '3',
      stateCode: ConsentRequestStateEnum.Declined,
      requestDate: '2025-03-01',
      dataRequest: { dataConsumer: { name: 'Charlie' }, titleDe: 'Antrag C' },
    } as ConsentRequestDto,
  ];

  beforeEach(async () => {
    mockConsentService = {
      updateConsentRequestStatus: jest.fn(),
    };
    mockToastService = {
      show: jest.fn(),
    };
    reloadSpy = jest.fn();
    rowActionSpy = jest.fn();

    await TestBed.configureTestingModule({
      imports: [ConsentRequestTableComponent],
      providers: [
        { provide: ConsentRequestService, useValue: mockConsentService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestTableComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set required @Input() values before initial detectChanges
    componentRef.setInput('consentRequests', sampleRequests);
    componentRef.setInput('tableRowAction', rowActionSpy);
    componentRef.setInput('reloadConsentRequests', reloadSpy);

    fixture.detectChanges();
  });

  function flushPromises(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  it('should map consentRequests to AgridataTableData via requests Signal', () => {
    // Initially, no filter applied → should map all three
    const rows: AgridataTableData[] = component.requests();
    expect(rows.length).toBe(3);

    // Verify mapping of first row
    const first = rows[0];
    expect(first.data).toEqual([
      { header: 'Antragsteller', value: 'Alice' },
      { header: 'Datenantrag', value: 'Antrag A' },
      { header: 'Antragsdatum', value: '2025-01-01' },
      { header: 'Status', value: ConsentRequestStateEnum.Opened },
    ]);
    // Highlighted only if stateCode is Opened
    expect(first.highlighted).toBe(true);

    // The rowAction for the first entry should call rowActionSpy with that DTO
    first.rowAction?.();
    expect(rowActionSpy).toHaveBeenCalledWith(sampleRequests[0]);
  });

  it('getCellValue returns the correct value or empty string', () => {
    const tableData: AgridataTableData = {
      id: '1',
      data: [
        { header: 'Foo', value: 'Bar' },
        { header: 'Baz', value: 'Quux' },
      ],
      highlighted: false,
      actions: [],
      rowAction: () => {},
    };

    expect(component.getCellValue(tableData, 'Foo')).toBe('Bar');
    expect(component.getCellValue(tableData, 'Nonexistent')).toBe('');
  });

  it('getFilteredActions returns correct actions for each state and callbacks work', () => {
    // For Opened:
    const reqOpened = sampleRequests[0];
    const actionsOpened = component.getFilteredActions(reqOpened);
    expect(actionsOpened.length).toBe(3);

    // labels: Details, Einwilligen, Ablehnen
    expect(actionsOpened[0].label).toBe('Details');
    expect(actionsOpened[1].label).toBe('Einwilligen');
    expect(actionsOpened[2].label).toBe('Ablehnen');

    // Invoke details callback → should call rowActionSpy(reqOpened)
    actionsOpened[0].callback();
    expect(rowActionSpy).toHaveBeenCalledWith(reqOpened);

    // Stub updateConsentRequestStatus to resolve for next callbacks
    mockConsentService.updateConsentRequestStatus.mockResolvedValue();

    // Invoke Einwilligen callback → should call updateConsentRequestState
    actionsOpened[1].callback();
    // After promise resolution and flushPromises, toast and reload should be called
    return flushPromises().then(() => {
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Einwilligung erteilt',
        `Du hast den Antrag ${reqOpened.dataRequest?.titleDe} erfolgreich eingewilligt.`,
        ToastType.Success,
      );
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  it('getFilteredActions for Declined state returns [Details, Einwilligen]', () => {
    const reqDeclined = sampleRequests[2];
    const actionsDeclined = component.getFilteredActions(reqDeclined);
    expect(actionsDeclined.length).toBe(2);
    expect(actionsDeclined[0].label).toBe('Details');
    expect(actionsDeclined[1].label).toBe('Einwilligen');
  });

  it('getFilteredActions for Granted state returns [Details, Ablehnen]', () => {
    const reqGranted = sampleRequests[1];
    const actionsGranted = component.getFilteredActions(reqGranted);
    expect(actionsGranted.length).toBe(2);
    expect(actionsGranted[0].label).toBe('Details');
    expect(actionsGranted[1].label).toBe('Ablehnen');
  });

  it('setStateFilter filters requests Signal correctly', () => {
    // Initially all 3
    expect(component.requests().length).toBe(3);

    // Filter to Granted
    component.setStateFilter(ConsentRequestStateEnum.Granted);
    const filtered = component.requests();
    expect(filtered.length).toBe(1);
    expect(filtered[0].data.find((c) => c.header === 'Status')?.value).toBe(
      ConsentRequestStateEnum.Granted,
    );
  });

  it('getBadgeVariant returns correct BadgeVariant for each state', () => {
    expect(component.getBadgeVariant(ConsentRequestStateEnum.Opened)).toBe(BadgeVariant.INFO);
    expect(component.getBadgeVariant(ConsentRequestStateEnum.Granted)).toBe(BadgeVariant.SUCCESS);
    expect(component.getBadgeVariant(ConsentRequestStateEnum.Declined)).toBe(BadgeVariant.ERROR);
    expect(component.getBadgeVariant('UNKNOWN')).toBe(BadgeVariant.DEFAULT);
  });

  describe('updateConsentRequestState', () => {
    it('on success, calls toastService.show and reloadConsentRequests', async () => {
      const req = sampleRequests[0];
      mockConsentService.updateConsentRequestStatus.mockResolvedValue();
      component.updateConsentRequestState(
        req.id,
        ConsentRequestStateEnum.Granted,
        req.dataRequest?.titleDe,
      );

      await flushPromises();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Einwilligung erteilt',
        `Du hast den Antrag ${req.dataRequest?.titleDe} erfolgreich eingewilligt.`,
        ToastType.Success,
      );
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('on failure, calls toastService.show with error details', async () => {
      const req = sampleRequests[1];
      const fakeError = { error: { message: 'FailMsg', requestId: 'RID123' } };
      mockConsentService.updateConsentRequestStatus.mockRejectedValue(fakeError);

      component.updateConsentRequestState(
        req.id,
        ConsentRequestStateEnum.Declined,
        req.dataRequest?.titleDe,
      );

      await flushPromises();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'FailMsg',
        `Fehler beim Aktualisieren des Antrags. RequestId: ${fakeError.error.requestId}`,
        ToastType.Error,
      );
      // reloadConsentRequests should NOT be called on error
      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });
});
