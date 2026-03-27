import { provideHttpClient } from '@angular/common/http';
import { ComponentRef, ResourceRef, Signal, inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  MockResources,
  mockDataRequests,
  createMockDataRequestService,
  MockDataRequestService,
  createMockToastService,
  MockToastService,
} from '@/shared/testing/mocks';
import { ToastService, ToastType } from '@/shared/toast';
import { BadgeVariant } from '@/shared/ui/badge';

import { DataRequestTableComponent } from './data-request-table.component';

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('DataRequestTableComponent', () => {
  let fixture: ComponentFixture<DataRequestTableComponent>;
  let component: DataRequestTableComponent;
  let componentRef: ComponentRef<DataRequestTableComponent>;
  let mockI18nService: jest.Mocked<I18nService>;
  let dataRequestService: MockDataRequestService;
  let toastService: MockToastService;
  let dataRequestsResource: Signal<ResourceRef<DataRequestDto[] | undefined>>;
  beforeEach(async () => {
    mockI18nService = {
      translate: jest.fn(),
      useObjectTranslation: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;
    dataRequestService = createMockDataRequestService();
    toastService = createMockToastService();
    dataRequestsResource = signal(MockResources.createMockResourceRef(mockDataRequests));
    await TestBed.configureTestingModule({
      imports: [DataRequestTableComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ToastService, useValue: toastService },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestTableComponent, {
      bindings: [
        inputBinding('dataRequestsResource', dataRequestsResource),
        inputBinding('dataRequests', signal(mockDataRequests)),
      ],
    });
    componentRef = fixture.componentRef;
    component = componentRef.instance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('getFilteredActions returns only details action for states other than InReview and Draft', () => {
    const toBeSignedRequest = mockDataRequests.find(
      (r) => r.stateCode === DataRequestStateEnum.ToBeSignedByConsumer,
    )!;
    const actions = component.getFilteredActions(toBeSignedRequest);
    expect(actions.length).toBe(1);
    expect(actions[0].label).toBe('data-request.table.tableActions.details');
  });

  it('getFilteredActions returns details and retreat actions for InReview state', () => {
    const actions = component.getFilteredActions(
      mockDataRequests.find((r) => r.stateCode === DataRequestStateEnum.InReview),
    );
    expect(actions.length).toBe(2);
    expect(actions[0].label).toBe('data-request.table.tableActions.details');
    expect(actions[1].label).toBe('data-request.table.tableActions.retreat');
  });

  it('getFilteredActions handles undefined request', () => {
    const actions = component.getFilteredActions();
    expect(actions).toEqual([]);
  });

  it('should get translated state value', () => {
    const i18nServiceSpy = jest.spyOn(mockI18nService, 'translate');

    component['getStatusTranslation'](DataRequestStateEnum.Draft);

    expect(i18nServiceSpy).toHaveBeenCalledWith('data-request.stateCode.DRAFT');
  });

  it('should handle undefined state value', () => {
    expect(component['getStatusTranslation'](undefined)).toBe('');
  });

  it('getBadgeVariant returns correct BadgeVariant for each state', () => {
    expect(component['getBadgeVariant'](DataRequestStateEnum.Draft)).toBe(BadgeVariant.INFO);
    expect(component['getBadgeVariant'](DataRequestStateEnum.InReview)).toBe(BadgeVariant.INFO);
    expect(component['getBadgeVariant'](DataRequestStateEnum.ToBeSignedByConsumer)).toBe(
      BadgeVariant.WARNING,
    );
    expect(component['getBadgeVariant'](DataRequestStateEnum.ToBeReleasedByConsumer)).toBe(
      BadgeVariant.WARNING,
    );
    expect(component['getBadgeVariant'](DataRequestStateEnum.Active)).toBe(BadgeVariant.SUCCESS);
    expect(component['getBadgeVariant'](undefined)).toBe(BadgeVariant.DEFAULT);
  });

  it('retreat callback should call service and reload data', async () => {
    const inReviewRequest = mockDataRequests.find(
      (r) => r.stateCode === DataRequestStateEnum.InReview,
    )!;
    const actions = component.getFilteredActions(inReviewRequest);
    const retreatAction = actions[1];

    retreatAction.callback();
    await flushPromises();

    expect(dataRequestService.retreatDataRequest).toHaveBeenCalledWith(inReviewRequest.id);
    expect(component.dataRequestsResource()?.reload).toHaveBeenCalled();
  });

  it('should emit action when row action is triggered', () => {
    const emitSpy = jest.spyOn(component.tableRowAction, 'emit');
    const request = mockDataRequests[0];

    const metadata = component['dataRequestsTableMetaData']();
    metadata.rowAction!(request);

    expect(emitSpy).toHaveBeenCalledWith(request);
  });

  it('dataRequestsTableMetaData should have correct structure', () => {
    const metadata = component['dataRequestsTableMetaData']();

    expect(metadata.idColumn).toBe('id');
    expect(metadata.columns.length).toBe(5);
    expect(metadata.columns[0].name).toBe(component['dataRequestHumanFriendlyIdHeader']);
    expect(metadata.columns[0].sortable).toBe(true);
    expect(metadata.columns[0].renderer.type).toBe('template');
  });

  it('should sort by sortValueFn for title column', () => {
    const metadata = component['dataRequestsTableMetaData']();
    const titleColumn = metadata.columns[1];
    const item = mockDataRequests[0];

    mockI18nService.useObjectTranslation.mockReturnValue('Translated Title');

    expect(titleColumn.sortValueFn).toBeDefined();
    if (titleColumn.sortValueFn) {
      const result = titleColumn.sortValueFn(item);
      expect(result).toBe('Translated Title');
      expect(mockI18nService.useObjectTranslation).toHaveBeenCalledWith(item.title);
    }
  });

  it('should sort by sortValueFn for state column', () => {
    const metadata = component['dataRequestsTableMetaData']();
    const stateColumn = metadata.columns[4];
    const item = mockDataRequests[0];

    mockI18nService.translate.mockReturnValue('Translated State');

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
    const metadata = component['dataRequestsTableMetaData']();
    const submissionDateColumn = metadata.columns[2];

    expect(submissionDateColumn.initialSortDirection).toBe('desc');
  });

  it('details action callback should emit tableRowAction', () => {
    const emitSpy = jest.spyOn(component.tableRowAction, 'emit');
    const request = mockDataRequests.find((r) => r.stateCode === DataRequestStateEnum.Draft)!;
    const actions = component.getFilteredActions(request);
    const detailsAction = actions[0];

    detailsAction.callback();

    expect(emitSpy).toHaveBeenCalledWith(request);
  });

  it('should render submission date correctly', () => {
    const metadata = component['dataRequestsTableMetaData']();
    const submissionDateColumn = metadata.columns[2];
    const item = mockDataRequests[0];

    if (submissionDateColumn.renderer.type === 'function') {
      const result = submissionDateColumn.renderer.cellRenderFn(item);
      expect(result).toBe(item.submissionDate);
    }
  });

  it('should render provider column correctly', () => {
    const metadata = component['dataRequestsTableMetaData']();
    const providerColumn = metadata.columns[3];
    const row = component['dataRequests']()[0];
    expect(row).toBeTruthy();

    expect(providerColumn.renderer.type).toEqual('function');

    if (providerColumn.renderer.type === 'function') {
      const result = providerColumn.renderer.cellRenderFn(row);
      expect(result).toBe('Agis');
    }
  });

  it('getFilteredActions returns details and delete actions for Draft state', () => {
    const draftRequest = mockDataRequests.find((r) => r.stateCode === DataRequestStateEnum.Draft)!;
    const actions = component.getFilteredActions(draftRequest);

    expect(actions.length).toBe(2);
    expect(actions[0].label).toBe('data-request.table.tableActions.details');
    expect(actions[1].label).toBe('data-request.table.tableActions.delete');
  });

  it('delete action callback sets requestToDelete and opens modal', async () => {
    const draftRequest = mockDataRequests.find((r) => r.stateCode === DataRequestStateEnum.Draft)!;
    const actions = component.getFilteredActions(draftRequest);
    const deleteAction = actions[1];

    deleteAction.callback();
    await flushPromises();

    expect(component['requestToDelete']()).toBe(draftRequest);
    expect(component['showDeleteModal']()).toBe(true);
  });

  it('cancelDelete resets requestToDelete and closes modal', () => {
    component['requestToDelete'].set(mockDataRequests[0]);
    component['showDeleteModal'].set(true);

    component['cancelDelete']();

    expect(component['requestToDelete']()).toBeNull();
    expect(component['showDeleteModal']()).toBe(false);
  });

  it('requestToDeleteTitle returns empty string when no request is set', () => {
    component['requestToDelete'].set(null);
    expect(component['requestToDeleteTitle']()).toBe('');
  });

  it('requestToDeleteTitle returns translated title when request is set', () => {
    mockI18nService.useObjectTranslation.mockReturnValue('Request A');
    component['requestToDelete'].set(mockDataRequests[0]);

    expect(component['requestToDeleteTitle']()).toBe('Request A');
    expect(mockI18nService.useObjectTranslation).toHaveBeenCalledWith(mockDataRequests[0].title);
  });

  it('deleteRequest calls service, shows success toast, reloads and resets state', async () => {
    mockI18nService.translate.mockReturnValue('translated');
    mockI18nService.useObjectTranslation.mockReturnValue('Request A');
    const draftRequest = mockDataRequests.find((r) => r.stateCode === DataRequestStateEnum.Draft)!;
    component['requestToDelete'].set(draftRequest);
    component['showDeleteModal'].set(true);

    await component['deleteRequest']();

    expect(dataRequestService.deleteDataRequest).toHaveBeenCalledWith(draftRequest.id);
    expect(toastService.show).toHaveBeenCalledWith('translated', 'translated', ToastType.Success);
    expect(component['dataRequestsResource']().reload).toHaveBeenCalled();
    expect(component['requestToDelete']()).toBeNull();
    expect(component['showDeleteModal']()).toBe(false);
  });

  it('deleteRequest does nothing when requestToDelete is null', async () => {
    component['requestToDelete'].set(null);

    await component['deleteRequest']();

    expect(dataRequestService.deleteDataRequest).not.toHaveBeenCalled();
  });

  it('deleteRequest shows error toast and resets state on failure', async () => {
    const testError = new Error('delete failed');
    dataRequestService.deleteDataRequest.mockRejectedValueOnce(testError);
    mockI18nService.translate.mockReturnValue('translated');
    mockI18nService.useObjectTranslation.mockReturnValue('Request A');
    const draftRequest = mockDataRequests.find((r) => r.stateCode === DataRequestStateEnum.Draft)!;
    component['requestToDelete'].set(draftRequest);
    component['showDeleteModal'].set(true);

    await component['deleteRequest']();

    expect(toastService.show).toHaveBeenCalledWith('translated', 'translated', ToastType.Error);
    expect(component['requestToDelete']()).toBeNull();
    expect(component['showDeleteModal']()).toBe(false);
  });
});
