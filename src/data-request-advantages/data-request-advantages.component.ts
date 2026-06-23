import { Component, input } from '@angular/core';

import { DataRequestAdvantageDto } from '@/entities/openapi';
import { I18nDirective } from '@/shared/i18n';

/**
 * Implements the advantages preview logic
 * shows the advantages in a list for the specific language
 *
 * CommentLastReviewed: 2026-06-23
 */
@Component({
  selector: 'app-data-request-advantages',
  imports: [I18nDirective],
  templateUrl: './data-request-advantages.component.html',
})
export class DataRequestAdvantagesComponent {
  readonly advantages = input<DataRequestAdvantageDto[]>();
  readonly lang = input<string>();

  protected getAdvantageText(advantage: DataRequestAdvantageDto, lang?: string): string {
    if (!lang) return '';
    return (advantage as Record<string, string>)[lang] ?? '';
  }
}
