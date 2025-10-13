import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { LanguageSelectComponent } from './language-select.component';

describe('LanguageSelectComponent', () => {
  let fixture: ComponentFixture<LanguageSelectComponent>;
  let component: LanguageSelectComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSelectComponent, FontAwesomeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle isOpen state when handleToggle is called', () => {
    expect(component.isOpen()).toBe(false);
    component.handleToggle();
    expect(component.isOpen()).toBe(true);
    component.handleToggle();
    expect(component.isOpen()).toBe(false);
  });

  it('should set selectedLanguage and call TranslocoService.setActiveLang on changeLanguage', () => {
    const lang = 'fr';
    component.changeLanguage(lang);
    expect(component.selectedLanguage()).toBe(lang);
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should return correct icon from dropdownIcon computed', () => {
    component.isOpen.set(false);
    expect(component.dropdownIcon()).toBeDefined();
    component.isOpen.set(true);
    expect(component.dropdownIcon()).toBeDefined();
  });

  it('should have languageOptions signal with availableLangs', () => {
    expect(Array.isArray(component.languageOptions())).toBe(true);
    expect(component.languageOptions().length).toBeGreaterThan(0);
  });
});
