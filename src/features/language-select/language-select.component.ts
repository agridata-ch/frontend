import { Component, computed, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { I18nService } from '@/shared/i18n/i18n.service';
import { PopoverComponent } from '@/shared/ui/popover/popover.component';

import { availableLangs } from '../../../transloco.config';

@Component({
  imports: [FontAwesomeModule, PopoverComponent],
  selector: 'agridata-language-select',
  templateUrl: './language-select.component.html',
})
export class LanguageSelectComponent {
  private readonly i18nService = inject(I18nService);
  readonly selectedLanguage = this.i18nService.lang;

  open = signal(false);
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
  };
}
