import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { DataRequestService } from '@/entities/api';
import { I18nService } from '@/shared/i18n';

import { DataRequestFormRequestComponent } from './data-request-form-request.component';

describe('DataRequestFormRequestComponent', () => {
  let fixture: ComponentFixture<DataRequestFormRequestComponent>;
  let component: DataRequestFormRequestComponent;
  let componentRef: ComponentRef<DataRequestFormRequestComponent>;
  let mockDataRequestService: jest.Mocked<DataRequestService>;
  let mockI18nService: jest.Mocked<I18nService>;
  let mockForm: FormGroup;

  beforeEach(async () => {
    mockDataRequestService = {
      fetchDataProducts: {
        value: jest.fn().mockReturnValue([
          { id: '1', name: { en: 'Product 1', de: 'Produkt 1' } },
          { id: '2', name: { en: 'Product 2', de: 'Produkt 2' } },
        ]),
      },
    } as unknown as jest.Mocked<DataRequestService>;

    mockI18nService = {
      lang: jest.fn().mockReturnValue('en'),
    } as unknown as jest.Mocked<I18nService>;

    await TestBed.configureTestingModule({
      imports: [DataRequestFormRequestComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: DataRequestService, useValue: mockDataRequestService },
      ],
    }).compileComponents();

    mockForm = new FormGroup({
      request: new FormGroup({
        products: new FormControl([]), // <-- Fix: should be FormControl with array value
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
