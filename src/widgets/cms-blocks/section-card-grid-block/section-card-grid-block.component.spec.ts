import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionCardGridBlockComponent } from './section-card-grid-block.component';

describe('SectionCardGridBlockComponent', () => {
  let component: SectionCardGridBlockComponent;
  let fixture: ComponentFixture<SectionCardGridBlockComponent>;
  let componentRef: ComponentRef<SectionCardGridBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionCardGridBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionCardGridBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      __component: 'layout.section-card-grid',
      id: 2,
      heading: 'Kernfunktionen',
      subHeading:
        'agridata.ch bietet Ihnen als Landwirt konkrete Funktionen zur Vereinfachung Ihrer Datenverarbeitung.',
      cards: [
        {
          id: 1,
          heading: 'Automatische Synchronisation',
          text: 'Ihre Daten werden automatisch zwischen den berechtigten Systemen synchronisiert. Manuelle Mehrfacheingaben entfallen.',
          image: {
            id: 26,
            documentId: 'ykuq85ofss5iu0p4v3png7xt',
            alternativeText: null,
            url: '/uploads/Screenshot_2025_09_02_at_13_20_19_8036e94f6c.png',
          },
        },
        {
          id: 2,
          heading: 'Audit-Protokoll',
          text: 'Vollständige Nachverfolgung aller Datenzugriffe. Sie sehen jederzeit, wann welche Daten abgerufen wurden.',
          image: {
            id: 27,
            documentId: 'wmru377ej3locmvma4k7wvwo',
            alternativeText: null,
            url: '/uploads/Screenshot_2025_09_02_at_13_20_28_8ede1faf83.png',
          },
        },
      ],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
