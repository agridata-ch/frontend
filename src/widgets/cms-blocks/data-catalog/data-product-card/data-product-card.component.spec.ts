import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicDataProductDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';

import { DataProductCardComponent } from './data-product-card.component';

const mockProduct: PublicDataProductDto = {
  id: 'product-1',
  stateCode: 'ACTIVE' as PublicDataProductDto['stateCode'],
  name: { de: 'Produktname' },
  description: { de: 'Produktbeschreibung' },
  dataSourceSystem: {
    id: 'system-1',
    name: { de: 'Quellsystem' },
    dataProvider: { id: 'provider-1' },
    legalBasis: { de: 'Rechtsgrundlage' },
  },
};

describe('DataProductCardComponent', () => {
  let component: DataProductCardComponent;
  let fixture: ComponentFixture<DataProductCardComponent>;
  let componentRef: ComponentRef<DataProductCardComponent>;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataProductCardComponent],
      providers: [{ provide: I18nService, useValue: i18nService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductCardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the localized name as the card title', () => {
    expect(fixture.nativeElement.querySelector('span.font-semibold')?.textContent).toContain(
      'Produktname',
    );
  });

  it('should render the localized description', () => {
    expect(fixture.nativeElement.textContent).toContain('Produktbeschreibung');
  });

  it('should render the data source system name as a badge', () => {
    expect(fixture.nativeElement.textContent).toContain('Quellsystem');
  });

  it('should not render a badge when there is no data source system', () => {
    componentRef.setInput('product', { ...mockProduct, dataSourceSystem: undefined });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-agridata-badge')).toBeNull();
  });
});
