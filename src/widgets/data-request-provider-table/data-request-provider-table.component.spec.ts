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
} from '@/shared/testing/mocks';
import { BadgeVariant } from '@/shared/ui/badge';

import { DataRequestProviderTableComponent } from './data-request-provider-table.component';

describe('DataRequestProviderTableComponent', () => {
  let fixture: ComponentFixture<DataRequestProviderTableComponent>;
  let component: DataRequestProviderTableComponent;
  let componentRef: ComponentRef<DataRequestProviderTableComponent>;
  let mockI18nService: jest.Mocked<I18nService>;
  let dataRequestService: MockDataRequestService;
  let dataRequestsResource: Signal<ResourceRef<DataRequestDto[] | undefined>>;
  beforeEach(async () => {
    mockI18nService = {
      translate: jest.fn(),
      useObjectTranslation: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;
    dataRequestService = createMockDataRequestService();
    dataRequestsResource = signal(MockResources.createMockResourceRef(mockDataRequests));
    await TestBed.configureTestingModule({
      imports: [DataRequestProviderTableComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: DataRequestService, useValue: dataRequestService },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestProviderTableComponent, {
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

  it('getFilteredActions returns only details action for most states', () => {
    const actions = component.getFilteredActions(mockDataRequests[0]);
    expect(actions.length).toBe(1);
    expect(actions[0].label).toBe('data-request.table.tableActions.details');
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
    expect(metadata.columns.length).toBe(6);
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
    const stateColumn = metadata.columns[5];
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
    const request = mockDataRequests[0];
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
});
