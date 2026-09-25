import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { AlertComponent } from '@/shared/ui/alert';

import { DataRequestPrivacyInfosComponent } from './data-request-privacy-infos.component';

describe('DataRequestPrivacyInfosComponent', () => {
  let component: DataRequestPrivacyInfosComponent;
  let componentRef: ComponentRef<DataRequestPrivacyInfosComponent>;
  let fixture: ComponentFixture<DataRequestPrivacyInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DataRequestPrivacyInfosComponent,
        createTranslocoTestingModule({
          langs: {
            de: {
              'data-request.privacy.title': 'Datenschutz',
              'data-request.privacy.description':
                'Zwischen {{ provider }} und {{ consumer }} besteht ein **Vertrag**.',
              'data-request.privacy.foreignConsumerAlert.title': 'Sitz im Ausland',
              'data-request.privacy.foreignConsumerAlert.message':
                'Der Empfänger hat seinen Sitz im Ausland ({{ city }}, {{ country }}).',
            },
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestPrivacyInfosComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should interpolate the consumer and the provider into the description', () => {
    componentRef.setInput('consumerName', 'Agrar AG');
    componentRef.setInput('providerName', 'Identitas AG');
    fixture.detectChanges();

    const text = fixture.debugElement.nativeElement.textContent;
    expect(text).toContain('Identitas AG');
    expect(text).toContain('Agrar AG');
  });

  it('should render the formatted parts of the description as markup', () => {
    const strong = fixture.debugElement.nativeElement.querySelector('strong');
    expect(strong?.textContent).toBe('Vertrag');
  });

  it('should not turn markdown in a consumer name into a link', () => {
    componentRef.setInput('consumerName', 'Agrar [Widerruf](https://evil.example)');
    componentRef.setInput('providerName', 'Identitas AG');
    fixture.detectChanges();

    const element = fixture.debugElement.nativeElement;
    expect(element.querySelector('a')).toBeNull();
    expect(element.textContent).toContain('Agrar Widerruf');
  });

  describe('foreign consumer alert', () => {
    it('should not render when no country is set', () => {
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(AlertComponent))).toBeNull();
    });

    it('should render with the city and the translated country name when the consumer is abroad', () => {
      componentRef.setInput('dataConsumerCity', 'Berlin');
      componentRef.setInput('dataConsumerCountry', 'DE');
      componentRef.setInput('isForeignConsumer', true);
      fixture.detectChanges();

      expect(component['countryDisplayName']()).toBe('Deutschland');

      const alert = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alert).not.toBeNull();
      expect(alert.nativeElement.textContent).toContain('Berlin');
      expect(alert.nativeElement.textContent).toContain('Deutschland');
    });
  });
});
