import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import { MockDataRequestService } from '@/shared/testing/mocks';

import { DataRequestPreviewComponent } from './data-request-preview.component';

describe('DataRequestPreviewComponent', () => {
  let component: DataRequestPreviewComponent;
  let fixture: ComponentFixture<DataRequestPreviewComponent>;
  let componentRef: ComponentRef<DataRequestPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestPreviewComponent],
      providers: [{ provide: DataRequestService, useClass: MockDataRequestService }],
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
