import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DataRequestAdvantageDto } from '@/entities/openapi';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestAdvantagesComponent } from './data-request-advantages.component';

const mockAdvantages: DataRequestAdvantageDto[] = [
  { de: 'Vorteil Deutsch', fr: 'Avantage Français', it: 'Vantaggio Italiano' },
  { de: 'Zweiter Vorteil', fr: 'Deuxième avantage', it: 'Secondo vantaggio' },
];

describe('DataRequestAdvantagesComponent', () => {
  describe('getAdvantageText', () => {
    let component: DataRequestAdvantagesComponent;
    let fixture: ComponentFixture<DataRequestAdvantagesComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DataRequestAdvantagesComponent],
      })
        .overrideComponent(DataRequestAdvantagesComponent, { set: { template: '' } })
        .compileComponents();

      fixture = TestBed.createComponent(DataRequestAdvantagesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should return empty string when lang is undefined', () => {
      expect(component['getAdvantageText'](mockAdvantages[0], undefined)).toBe('');
    });

    it('should return the German text for lang "de"', () => {
      expect(component['getAdvantageText'](mockAdvantages[0], 'de')).toBe('Vorteil Deutsch');
    });

    it('should return the French text for lang "fr"', () => {
      expect(component['getAdvantageText'](mockAdvantages[0], 'fr')).toBe('Avantage Français');
    });

    it('should return the Italian text for lang "it"', () => {
      expect(component['getAdvantageText'](mockAdvantages[0], 'it')).toBe('Vantaggio Italiano');
    });

    it('should return empty string when the language key is absent from the advantage', () => {
      const partialAdvantage = { de: 'Nur Deutsch' } as DataRequestAdvantageDto;
      expect(component['getAdvantageText'](partialAdvantage, 'fr')).toBe('');
    });
  });

  describe('DOM rendering', () => {
    let componentRef: ComponentRef<DataRequestAdvantagesComponent>;
    let fixture: ComponentFixture<DataRequestAdvantagesComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DataRequestAdvantagesComponent, createTranslocoTestingModule()],
      }).compileComponents();

      fixture = TestBed.createComponent(DataRequestAdvantagesComponent);
      componentRef = fixture.componentRef;
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should render no list items when advantages is undefined', () => {
      fixture.detectChanges();
      const items = fixture.debugElement.queryAll(By.css('li'));
      expect(items).toHaveLength(0);
    });

    it('should render one list item per advantage', () => {
      componentRef.setInput('advantages', mockAdvantages);
      componentRef.setInput('lang', 'de');
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('li'));
      expect(items).toHaveLength(mockAdvantages.length);
    });

    it('should display the correct language text in each list item', () => {
      componentRef.setInput('advantages', mockAdvantages);
      componentRef.setInput('lang', 'fr');
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('li'));
      expect(items[0].nativeElement.textContent.trim()).toBe('Avantage Français');
      expect(items[1].nativeElement.textContent.trim()).toBe('Deuxième avantage');
    });
  });
});
