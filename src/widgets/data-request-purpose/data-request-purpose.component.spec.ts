import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestPurposeDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestPurposeComponent } from './data-request-purpose.component';

const mockPurpose = {
  de: 'Zweck Deutsch',
  fr: 'But français',
  it: 'Scopo italiano',
} as DataRequestPurposeDto;

describe('DataRequestPurposeComponent', () => {
  describe('translatedPurpose', () => {
    let component: DataRequestPurposeComponent;
    let componentRef: ComponentRef<DataRequestPurposeComponent>;
    let fixture: ComponentFixture<DataRequestPurposeComponent>;
    let i18nService: MockI18nService;

    beforeEach(async () => {
      i18nService = createMockI18nService();

      await TestBed.configureTestingModule({
        imports: [DataRequestPurposeComponent],
        providers: [{ provide: I18nService, useValue: i18nService }],
      })
        .overrideComponent(DataRequestPurposeComponent, { set: { template: '' } })
        .compileComponents();

      fixture = TestBed.createComponent(DataRequestPurposeComponent);
      component = fixture.componentInstance;
      componentRef = fixture.componentRef;
      fixture.detectChanges();
    });

    it('should use the active language of the i18n service when no lang input is set', () => {
      componentRef.setInput('purpose', mockPurpose);
      fixture.detectChanges();

      expect(component['translatedPurpose']()).toBe('Zweck Deutsch');
    });

    it('should prefer the lang input over the active language', () => {
      componentRef.setInput('purpose', mockPurpose);
      componentRef.setInput('lang', 'fr');
      fixture.detectChanges();

      expect(component['translatedPurpose']()).toBe('But français');
    });
  });

  describe('DOM rendering', () => {
    let componentRef: ComponentRef<DataRequestPurposeComponent>;
    let fixture: ComponentFixture<DataRequestPurposeComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          DataRequestPurposeComponent,
          createTranslocoTestingModule({
            langs: {
              de: {
                'data-request.purpose.title': 'Was macht {{ consumer }} mit meinen Daten?',
              },
            },
          }),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(DataRequestPurposeComponent);
      componentRef = fixture.componentRef;
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should interpolate the consumer name into the title', () => {
      componentRef.setInput('consumerName', 'Agrar AG');
      fixture.detectChanges();

      const title = fixture.debugElement.nativeElement.querySelector('h4');
      expect(title.textContent).toContain('Agrar AG');
    });

    it('should render the purpose text of the requested language', () => {
      componentRef.setInput('purpose', mockPurpose);
      componentRef.setInput('lang', 'de');
      fixture.detectChanges();

      expect(fixture.debugElement.nativeElement.textContent).toContain('Zweck Deutsch');
    });
  });
});
