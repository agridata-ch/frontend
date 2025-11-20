import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { createMockDataRequestService, MockDataRequestService } from '@/shared/testing/mocks';
import {
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks/mock-master-data-service';

import { DataRequestPreviewComponent } from './data-request-preview.component';

describe('DataRequestPreviewComponent', () => {
  let component: DataRequestPreviewComponent;
  let fixture: ComponentFixture<DataRequestPreviewComponent>;
  let componentRef: ComponentRef<DataRequestPreviewComponent>;
  let metadataService: MockMasterDataService;
  let dataRequestService: MockDataRequestService;
  beforeEach(async () => {
    metadataService = createMockMasterDataService();
    dataRequestService = createMockDataRequestService();
    await TestBed.configureTestingModule({
      imports: [DataRequestPreviewComponent],
      providers: [
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: MasterDataService, useValue: metadataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestPreviewComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return value from getFieldFromLang', () => {
    componentRef.setInput('dataRequest', {
      title: { en: 'Test Title', de: 'Test Titel' },
      description: { en: 'Test Description', de: 'Test Beschreibung' },
    });
    const result = component.getFieldFromLang('title', 'en');
    expect(result).toEqual('Test Title');
  });
});
