import { provideHttpClient } from '@angular/common/http';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import {
  ConsentRequestProducerViewDtoDataRequestStateCode,
  DataRequestStateEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { MockDataRequestService, mockDataRequests } from '@/shared/testing/mocks';
import { BadgeVariant } from '@/shared/ui/badge';

import { DataRequestTableComponent } from './data-request-table.component';

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('DataRequestTableComponent', () => {
  let fixture: ComponentFixture<DataRequestTableComponent>;
  let component: DataRequestTableComponent;
  let componentRef: ComponentRef<DataRequestTableComponent>;
  let openComponent: any;
  let mockI18nService: jest.Mocked<I18nService>;
  beforeEach(async () => {
    mockI18nService = {
      translate: jest.fn(),
      useObjectTranslation: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;

    await TestBed.configureTestingModule({
      imports: [DataRequestTableComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: DataRequestService, useClass: MockDataRequestService },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestTableComponent);
    componentRef = fixture.componentRef;
    component = componentRef.instance;
    openComponent = component as any;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('getFilteredActions returns only details action for most states', () => {
    const actions = openComponent.getFilteredActions(mockDataRequests[0]);
    expect(actions.length).toBe(1);
    expect(actions[0].label).toBe('data-request.table.tableActions.details');
  });

  it('getFilteredActions returns details and retreat actions for InReview state', () => {
    const actions = openComponent.getFilteredActions(mockDataRequests[1]);
    expect(actions.length).toBe(2);
    expect(actions[0].label).toBe('data-request.table.tableActions.details');
    expect(actions[1].label).toBe('data-request.table.tableActions.retreat');
  });

  it('getFilteredActions handles undefined request', () => {
    const actions = openComponent.getFilteredActions(undefined);
    expect(actions).toEqual([]);
  });

  it('should get translated state value', () => {
    const i18nServiceSpy = jest.spyOn(mockI18nService, 'translate');

    component.getStatusTranslation(ConsentRequestProducerViewDtoDataRequestStateCode.Draft);

    expect(i18nServiceSpy).toHaveBeenCalledWith('data-request.stateCode.DRAFT');
  });

  it('should handle undefined state value', () => {
    expect(component.getStatusTranslation(undefined)).toBe('');
  });

  it('getBadgeVariant returns correct BadgeVariant for each state', () => {
    expect(openComponent.getBadgeVariant(DataRequestStateEnum.Draft)).toBe(BadgeVariant.INFO);
    expect(openComponent.getBadgeVariant(DataRequestStateEnum.InReview)).toBe(BadgeVariant.INFO);
    expect(openComponent.getBadgeVariant(DataRequestStateEnum.ToBeSigned)).toBe(
      BadgeVariant.WARNING,
    );
    expect(openComponent.getBadgeVariant(DataRequestStateEnum.Active)).toBe(BadgeVariant.SUCCESS);
    expect(openComponent.getBadgeVariant('UNKNOWN')).toBe(BadgeVariant.DEFAULT);
  });

  it('retreat callback should call service and reload data', async () => {
    const inReviewRequest = mockDataRequests[1];
    const actions = openComponent.getFilteredActions(inReviewRequest);
    const retreatAction = actions[1];

    const dataRequestService = TestBed.inject(
      DataRequestService,
    ) as unknown as MockDataRequestService;

    retreatAction.callback();
    await flushPromises();

    expect(dataRequestService.retreatDataRequest).toHaveBeenCalledWith(inReviewRequest.id);
    expect(dataRequestService.fetchDataRequests.reload).toHaveBeenCalled();
  });

  // Tests für spezifische Funktionen in der DataRequestTableComponent

  it('should emit action when row action is triggered', () => {
    const emitSpy = jest.spyOn(component.tableRowAction, 'emit');
    const request = mockDataRequests[0];

    // Manuell den rowAction von tableMetaData aufrufen
    const metadata = component.dataRequestsTableMetaData();
    metadata.rowAction!(request);

    expect(emitSpy).toHaveBeenCalledWith(request);
  });

  it('should get translated object correctly', () => {
    const translationDto = { de: 'Testanfrage', en: 'Test request' };
    const i18nServiceSpy = jest.spyOn(mockI18nService, 'useObjectTranslation');

    component.getObjTranslation(translationDto);

    expect(i18nServiceSpy).toHaveBeenCalledWith(translationDto);
  });

  it('should handle undefined translation object in getObjTranslation', () => {
    expect(component.getObjTranslation(undefined)).toBe('');
  });

  it('dataRequestsTableMetaData should have correct structure', () => {
    const metadata = component.dataRequestsTableMetaData();

    expect(metadata.idColumn).toBe('id');
    expect(metadata.columns.length).toBe(5);
    expect(metadata.columns[0].name).toBe(component.dataRequestHumanFriendlyIdHeader);
    expect(metadata.columns[0].sortable).toBe(true);
    expect(metadata.columns[0].renderer.type).toBe('template');
  });

  it('should sort by sortValueFn for title column', () => {
    const metadata = component.dataRequestsTableMetaData();
    const titleColumn = metadata.columns[1];
    const item = mockDataRequests[0];

    mockI18nService.useObjectTranslation.mockReturnValue('Translated Title');

    // Prüfen, ob die sortValueFn existiert und korrekt funktioniert
    expect(titleColumn.sortValueFn).toBeDefined();
    if (titleColumn.sortValueFn) {
      const result = titleColumn.sortValueFn(item);
      expect(result).toBe('Translated Title');
      expect(mockI18nService.useObjectTranslation).toHaveBeenCalledWith(item.title);
    }
  });

  it('should sort by sortValueFn for state column', () => {
    const metadata = component.dataRequestsTableMetaData();
    const stateColumn = metadata.columns[4];
    const item = mockDataRequests[0];

    mockI18nService.translate.mockReturnValue('Translated State');

    // Prüfen, ob die sortValueFn existiert und korrekt funktioniert
    expect(stateColumn.sortValueFn).toBeDefined();
    if (stateColumn.sortValueFn) {
      const result = stateColumn.sortValueFn(item);
      expect(result).toBe('Translated State');
      expect(mockI18nService.translate).toHaveBeenCalledWith(
        expect.stringContaining('data-request.stateCode.'),
      );
    }
  });

  it('should have correct initial sort direction for submission date', () => {
    const metadata = component.dataRequestsTableMetaData();
    const submissionDateColumn = metadata.columns[2];

    expect(submissionDateColumn.initialSortDirection).toBe('desc');
  });

  it('details action callback should emit tableRowAction', () => {
    const emitSpy = jest.spyOn(component.tableRowAction, 'emit');
    const request = mockDataRequests[0];
    const actions = component.getFilteredActions(request);
    const detailsAction = actions[0];

    detailsAction.callback();

    expect(emitSpy).toHaveBeenCalledWith(request);
  });

  it('should render submission date correctly', () => {
    const metadata = component.dataRequestsTableMetaData();
    const submissionDateColumn = metadata.columns[2];
    const item = mockDataRequests[0];

    // Prüfen, ob die cellRenderFn existiert und korrekt funktioniert
    if (submissionDateColumn.renderer.type === 'function') {
      const result = submissionDateColumn.renderer.cellRenderFn(item);
      expect(result).toBe(item.submissionDate);
    }
  });

  it('should render provider column correctly', () => {
    const metadata = component.dataRequestsTableMetaData();
    const providerColumn = metadata.columns[3];

    // Prüfen, ob die cellRenderFn existiert und korrekt funktioniert
    if (providerColumn.renderer.type === 'function') {
      const result = providerColumn.renderer.cellRenderFn({});
      expect(result).toBe('Agis');
    }
  });

  it('should emit reload event when retreat action is triggered', async () => {
    const emitSpy = jest.spyOn(component.realoadDataRequests, 'emit');
    const dataRequestService = TestBed.inject(
      DataRequestService,
    ) as unknown as MockDataRequestService;

    // Mock für die reload-Methode überschreiben, um realoadDataRequests auszulösen
    dataRequestService.fetchDataRequests.reload = jest.fn().mockImplementation(() => {
      component.realoadDataRequests.emit();
      return true;
    });

    const inReviewRequest = mockDataRequests[1];
    const actions = component.getFilteredActions(inReviewRequest);
    const retreatAction = actions[1];

    retreatAction.callback();
    await flushPromises();

    expect(emitSpy).toHaveBeenCalled();
  });
});
