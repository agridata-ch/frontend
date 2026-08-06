import { Component, inject, input } from '@angular/core';

import { DataRequestAdvantageDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';

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
  // Injects
  private readonly i18nService = inject(I18nService);

  // Inputs
  readonly advantages = input<DataRequestAdvantageDto[]>();
  readonly lang = input<string>();

  protected getAdvantageText(advantage: DataRequestAdvantageDto, lang?: string): string {
    return (advantage as Record<string, string>)[lang ?? this.i18nService.lang()] ?? '';
  }
}
