import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { MetaDataService } from '@/entities/api/meta-data-service';
import { I18nService } from '@/shared/i18n';
import { MockI18nService } from '@/shared/testing/mocks';
import { mockMetadataService } from '@/shared/testing/mocks/mock-meta-data.service';

import { DataRequestFormRequestComponent } from './data-request-form-request.component';

const mockForm = new FormGroup({
  request: new FormGroup({
    products: new FormControl([]),
    title: new FormGroup({
      de: new FormControl(''),
      fr: new FormControl(''),
      it: new FormControl(''),
    }),
    description: new FormGroup({
      de: new FormControl(''),
      fr: new FormControl(''),
      it: new FormControl(''),
    }),
    purpose: new FormGroup({
      de: new FormControl(''),
      fr: new FormControl(''),
      it: new FormControl(''),
    }),
  }),
});

let fixture: ComponentFixture<DataRequestFormRequestComponent>;
let component: DataRequestFormRequestComponent;
let componentRef: ComponentRef<DataRequestFormRequestComponent>;
let metadataService: Partial<MetaDataService>;

describe('DataRequestFormRequestComponent', () => {
  metadataService = mockMetadataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestFormRequestComponent],
      providers: [
        { provide: I18nService, useClass: MockI18nService },
        { provide: MetaDataService, useValue: metadataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormRequestComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('form', mockForm);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets products to empty array if dataProductsResource is empty', () => {
    expect(component.products()).toEqual([]);
  });
});
