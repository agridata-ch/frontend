import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MasterDataService } from '@/entities/api/master-data.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockI18nService,
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks';

import { DataRequestFormRequestComponent } from './data-request-form-request.component';

const createMockForm = () =>
  new FormGroup({
    request: new FormGroup({
      advantages: new FormControl([]),
      products: new FormControl([], Validators.required),
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
let masterDataService: MockMasterDataService;

describe('DataRequestFormRequestComponent', () => {
  beforeEach(async () => {
    masterDataService = createMockMasterDataService();

    await TestBed.configureTestingModule({
      imports: [DataRequestFormRequestComponent],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: masterDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormRequestComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('form', createMockForm());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formDisabled input', () => {
    it('should default to false', () => {
      expect(component.formDisabled()).toBe(false);
    });

    it('should accept true value', () => {
      componentRef.setInput('formDisabled', true);
      fixture.detectChanges();

      expect(component.formDisabled()).toBe(true);
    });
  });

  describe('dataProviderId input', () => {
    it('should default to undefined', () => {
      expect(component.dataProviderId()).toBeUndefined();
    });

    it('should accept a provider ID string', () => {
      componentRef.setInput('dataProviderId', 'provider-1');
      fixture.detectChanges();

      expect(component.dataProviderId()).toBe('provider-1');
    });
  });

  describe('providerLoading', () => {
    it('should be false by default', () => {
      expect(component['providerLoading']()).toBe(false);
    });

    it('should reflect the master data service loading state', () => {
      masterDataService.providersLoading.set(true);
      fixture.detectChanges();

      expect(component['providerLoading']()).toBe(true);
    });
  });
});
