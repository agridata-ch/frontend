import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

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
});
