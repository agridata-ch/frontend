import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardBlockComponent } from './card-block.component';

const mockCard = {
  id: 1,
  heading: 'Automatische Synchronisation',
  text: 'Ihre Daten werden automatisch zwischen den berechtigten Systemen synchronisiert. Manuelle Mehrfacheingaben entfallen.',
  image: {
    id: 26,
    documentId: 'ykuq85ofss5iu0p4v3png7xt',
    alternativeText: null,
    url: '/uploads/Screenshot_2025_09_02_at_13_20_19_8036e94f6c.png',
  },
};

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

    componentRef.setInput('card', mockCard);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('colorClasses', () => {
    it('should return the correct color classes based on the card data', () => {
      componentRef.setInput('card', {
        ...mockCard,
        colorized: true,
        color: 'Green',
      });

      fixture.detectChanges();

      expect(component.colorClasses()).toContain('bg-agridata-secondary-600');
    });

    it('should return the correct color classes based on the card data', () => {
      componentRef.setInput('card', {
        ...mockCard,
        colorized: true,
        color: 'Blue',
      });

      fixture.detectChanges();

      expect(component.colorClasses()).toContain('bg-agridata-primary-300');
    });

    it('should return the correct color classes based on the card data', () => {
      componentRef.setInput('card', {
        ...mockCard,
        colorized: true,
        color: 'Red',
      });

      fixture.detectChanges();

      expect(component.colorClasses()).toContain('bg-red-300');
    });

    it('should return the correct color classes based on the card data', () => {
      componentRef.setInput('card', {
        ...mockCard,
        colorized: true,
        color: 'Yellow',
      });

      fixture.detectChanges();

      expect(component.colorClasses()).toContain('bg-yellow-200');
    });

    it('should return the correct color classes based on the card data', () => {
      componentRef.setInput('card', {
        ...mockCard,
        colorized: true,
        color: 'Orange',
      });

      fixture.detectChanges();

      expect(component.colorClasses()).toContain('bg-orange-300');
    });
  });
});
