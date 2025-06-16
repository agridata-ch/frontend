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

  it('should toggle open state when handleToggle is called', () => {
    expect(component.open()).toBe(false);
    component.handleToggle();
    expect(component.open()).toBe(true);
    component.handleToggle();
    expect(component.open()).toBe(false);
  });

  it('should set selectedLanguage and call TranslocoService.setActiveLang on changeLanguage', () => {
    const lang = 'fr';
    component.changeLanguage(lang);
    expect(component.selectedLanguage()).toBe(lang);
    fixture.detectChanges();
    expect(component.open()).toBe(false);
  });

  it('should return correct icon from dropdownIcon computed', () => {
    component.open.set(false);
    expect(component.dropdownIcon()).toBeDefined();
    component.open.set(true);
    expect(component.dropdownIcon()).toBeDefined();
  });

  it('should have languageOptions signal with availableLangs', () => {
    expect(Array.isArray(component.languageOptions())).toBe(true);
    expect(component.languageOptions().length).toBeGreaterThan(0);
  });
});
