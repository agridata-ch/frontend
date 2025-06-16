import { Component, computed, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { defaultLang } from '@/app/i18n.config';
import { I18nService } from '@/shared/i18n/i18n.service';

import { availableLangs } from '../../../transloco.config';

@Component({
  imports: [FontAwesomeModule],
  selector: 'agridata-language-select',
  templateUrl: './language-select.component.html',
})
export class LanguageSelectComponent {
  private readonly i18nService = inject(I18nService);

  open = signal(false);
  selectedLanguage = signal(defaultLang);
  languageOptions = signal(availableLangs);

  dropdownIcon = computed(() => {
    return this.open() ? faChevronUp : faChevronDown;
  });

  handleToggle() {
    this.open.set(!this.open());
  }

  changeLanguage = (lang: string) => {
    this.open.set(false);
    this.i18nService.setActiveLang(lang);
    this.selectedLanguage.set(lang);
  };
}
