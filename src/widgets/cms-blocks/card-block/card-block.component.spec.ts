import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardBlockComponent } from './card-block.component';

describe('CardBlockComponent', () => {
  let component: CardBlockComponent;
  let fixture: ComponentFixture<CardBlockComponent>;
  let componentRef: ComponentRef<CardBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardBlockComponent);
    component = fixture.componentInstance;

    componentRef = fixture.componentRef;

    componentRef.setInput('card', {
      id: 1,
      heading: 'Automatische Synchronisation',
      text: 'Ihre Daten werden automatisch zwischen den berechtigten Systemen synchronisiert. Manuelle Mehrfacheingaben entfallen.',
      image: {
        id: 26,
        documentId: 'ykuq85ofss5iu0p4v3png7xt',
        alternativeText: null,
        url: '/uploads/Screenshot_2025_09_02_at_13_20_19_8036e94f6c.png',
      },
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
