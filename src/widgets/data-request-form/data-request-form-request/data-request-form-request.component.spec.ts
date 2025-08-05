import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { DataRequestService } from '@/entities/api';
import { I18nService } from '@/shared/i18n';
import { MockI18nService } from '@/shared/testing/mocks';

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
let mockDataRequestService: jest.Mocked<DataRequestService>;

describe('DataRequestFormRequestComponent', () => {
  beforeEach(async () => {
    mockDataRequestService = {
      fetchDataProducts: {
        value: jest
          .fn()
          .mockReturnValue([
            { id: 'productWithName', name: { en: 'Product 1', de: 'Produkt 1' } },
            { id: 'productWithoutName' },
          ]),
      },
    } as unknown as jest.Mocked<DataRequestService>;

    await TestBed.configureTestingModule({
      imports: [DataRequestFormRequestComponent],
      providers: [
        { provide: I18nService, useClass: MockI18nService },
        { provide: DataRequestService, useValue: mockDataRequestService },
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
});

describe('DataRequestFormRequestComponent with empty products', () => {
  beforeEach(async () => {
    mockDataRequestService = {
      fetchDataProducts: {
        value: jest.fn(),
      },
    } as unknown as jest.Mocked<DataRequestService>;

    await TestBed.configureTestingModule({
      imports: [DataRequestFormRequestComponent],
      providers: [
        { provide: I18nService, useClass: MockI18nService },
        { provide: DataRequestService, useValue: mockDataRequestService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormRequestComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('form', mockForm);
    fixture.detectChanges();
  });

  it('sets products to empty array if dataProductsResource is empty', () => {
    expect(component.products()).toEqual([]);
  });
});
