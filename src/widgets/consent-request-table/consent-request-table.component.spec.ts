import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestService } from '@/entities/api/consent-request.service';
import { ConsentRequestDto, ConsentRequestStateEnum } from '@/entities/openapi';
import { getToastMessage, getToastTitle, getToastType } from '@/shared/consent-request';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataTableData } from '@/shared/ui/agridata-table';
import { BadgeVariant } from '@/shared/ui/badge';

import { ConsentRequestTableComponent } from './consent-request-table.component';

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('ConsentRequestTableComponent', () => {
  let fixture: ComponentFixture<ConsentRequestTableComponent>;
  let component: ConsentRequestTableComponent;
  let componentRef: ComponentRef<ConsentRequestTableComponent>;
  let mockToastService: { show: jest.Mock };
  let mockConsentService: { updateConsentRequestStatus: jest.Mock };

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
      requestDate: '2025-01-02',
      dataRequest: { dataConsumer: { name: 'Bob' }, titleDe: 'Antrag B' },
    } as ConsentRequestDto,
    {
      id: '3',
      stateCode: ConsentRequestStateEnum.Declined,
      requestDate: '2025-01-03',
      dataRequest: { dataConsumer: { name: 'Carol' }, titleDe: 'Antrag C' },
    } as ConsentRequestDto,
  ];

  beforeEach(async () => {
    mockToastService = { show: jest.fn() };
    mockConsentService = { updateConsentRequestStatus: jest.fn().mockResolvedValue({}) };

    await TestBed.configureTestingModule({
      imports: [ConsentRequestTableComponent],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: ConsentRequestService, useValue: mockConsentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestTableComponent);
    componentRef = fixture.componentRef;
    component = componentRef.instance;

    componentRef.setInput('consentRequests', sampleRequests);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should map consentRequests to table rows and emit rowAction output', () => {
    const rowSpy = jest.fn();
    component.tableRowAction.subscribe(rowSpy);

    const rows = component.requests();
    expect(rows.length).toBe(3);

    const first = rows[0];
    // test rowAction emits correctly
    first.rowAction?.();
    expect(rowSpy).toHaveBeenCalledWith(sampleRequests[0]);
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

  it('getFilteredActions returns correct actions for Opened', () => {
    const actions = component.getFilteredActions(sampleRequests[0]);
    expect(actions.length).toBe(3);
    expect(actions[0].label).toBe('Details');
    expect(actions[1].label).toBe('Einwilligen');
    expect(actions[2].label).toBe('Ablehnen');
  });

  it('getFilteredActions returns correct actions for Granted', () => {
    const actions = component.getFilteredActions(sampleRequests[1]);
    expect(actions.length).toBe(2);
    expect(actions[0].label).toBe('Details');
    expect(actions[1].label).toBe('Ablehnen');
  });

  it('getFilteredActions returns correct actions for Declined', () => {
    const actions = component.getFilteredActions(sampleRequests[2]);
    expect(actions.length).toBe(2);
    expect(actions[0].label).toBe('Details');
    expect(actions[1].label).toBe('Einwilligen');
  });

  it('setStateCodeFilter filters requests Signal correctly', () => {
    expect(component.requests().length).toBe(3);

    component.setStateCodeFilter(ConsentRequestStateEnum.Granted);
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
    it('emits reload and shows toast on success', async () => {
      const reloadSpy = jest.fn();
      component.onReloadConsentRequests.subscribe(reloadSpy);

      // call update
      component.updateConsentRequestState(
        sampleRequests[0].id,
        ConsentRequestStateEnum.Granted,
        sampleRequests[0].dataRequest?.titleDe,
      );
      await flushPromises();

      expect(mockToastService.show).toHaveBeenCalledWith(
        getToastTitle(ConsentRequestStateEnum.Granted),
        getToastMessage(ConsentRequestStateEnum.Granted, sampleRequests[0].dataRequest?.titleDe),
        getToastType(ConsentRequestStateEnum.Granted),
        expect.any(Object), // your undo action
      );
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('shows error toast and does not reload on failure', async () => {
      const reloadSpy = jest.fn();
      component.onReloadConsentRequests.subscribe(reloadSpy);

      const fakeError = { error: { message: 'Fail', requestId: 'RID' } };
      mockConsentService.updateConsentRequestStatus.mockRejectedValueOnce(fakeError);

      component.updateConsentRequestState(
        sampleRequests[1].id,
        ConsentRequestStateEnum.Declined,
        sampleRequests[1].dataRequest?.titleDe,
      );
      await flushPromises();

      expect(mockToastService.show).toHaveBeenCalledWith(
        fakeError.error.message,
        `Fehler beim Aktualisieren des Antrags. RequestId: ${fakeError.error.requestId}`,
        ToastType.Error,
      );
      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });
});
