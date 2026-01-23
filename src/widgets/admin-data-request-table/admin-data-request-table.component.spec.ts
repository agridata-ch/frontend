import { provideHttpClient } from '@angular/common/http';
import { ComponentRef, ResourceRef, Signal, inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import {
  ConsentRequestProducerViewDtoDataRequestStateCode,
  DataRequestDto,
  DataRequestStateEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  MockResources,
  mockDataRequests,
  createMockDataRequestService,
  MockDataRequestService,
} from '@/shared/testing/mocks';
import { BadgeVariant } from '@/shared/ui/badge';

import { AdminDataRequestTableComponent } from './admin-data-request-table.component';

describe('DataRequestTableComponent', () => {
  let fixture: ComponentFixture<AdminDataRequestTableComponent>;
  let component: AdminDataRequestTableComponent;
  let componentRef: ComponentRef<AdminDataRequestTableComponent>;
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
      imports: [AdminDataRequestTableComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: DataRequestService, useValue: dataRequestService },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDataRequestTableComponent, {
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

  it('should get translated state value', () => {
    const i18nServiceSpy = jest.spyOn(mockI18nService, 'translate');

    component['getStatusTranslation'](ConsentRequestProducerViewDtoDataRequestStateCode.Draft);

    expect(i18nServiceSpy).toHaveBeenCalledWith('data-request.stateCode.DRAFT');
  });

  it('should handle undefined state value', () => {
    expect(component['getStatusTranslation'](undefined)).toBe('');
  });

  it('getBadgeVariant returns correct BadgeVariant for each state', () => {
    expect(component['getBadgeVariant'](DataRequestStateEnum.Draft)).toBe(BadgeVariant.INFO);
    expect(component['getBadgeVariant'](DataRequestStateEnum.InReview)).toBe(BadgeVariant.INFO);
    expect(component['getBadgeVariant'](DataRequestStateEnum.ToBeSigned)).toBe(
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
    expect(metadata.columns.length).toBe(5);
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
});
