import { Component, computed, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { I18nService } from '@/shared/i18n/i18n.service';
import { PopoverComponent } from '@/shared/ui/popover/popover.component';

import { availableLangs } from '../../../transloco.config';

/**
 * Component for selecting the active application language.
 * Renders a dropdown with available languages and updates the translation service
 * when the user chooses a new option. Integrates with i18n and click-outside handling.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  imports: [FontAwesomeModule, PopoverComponent, ClickOutsideDirective],
  selector: 'agridata-language-select',
  templateUrl: './language-select.component.html',
})
export class LanguageSelectComponent {
  private readonly i18nService = inject(I18nService);
  readonly selectedLanguage = this.i18nService.lang;

  isOpen = signal(false);
  languageOptions = signal(availableLangs);

  dropdownIcon = computed(() => {
    return this.isOpen() ? faChevronUp : faChevronDown;
  });

  handleToggle() {
    this.isOpen.set(!this.isOpen());
  }

  changeLanguage = (lang: string) => {
    this.isOpen.set(false);
    this.i18nService.setActiveLang(lang);
  };

  handleClose() {
    this.isOpen.set(false);
  }
}
