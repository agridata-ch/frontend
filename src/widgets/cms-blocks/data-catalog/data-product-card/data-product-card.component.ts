import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { faShieldCheck } from '@awesome.me/kit-0b6d1ed528/icons/classic/solid';

import { PublicDataProductDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { CardComponent } from '@/shared/ui/card';

/**
 * Renders a single public data product as a card, mapping the product DTO onto the generic card slots
 * (data source system as a tag, name as title, description as body).
 *
 * CommentLastReviewed: 2026-08-27
 */
@Component({
  selector: 'app-data-product-card',
  imports: [AgridataBadgeComponent, ButtonComponent, CardComponent, I18nDirective],
  templateUrl: './data-product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataProductCardComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly BadgeSize = BadgeSize;
  protected readonly BadgeVariant = BadgeVariant;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly publicSectorIcon = faShieldCheck;

  // Input properties
  readonly product = input.required<PublicDataProductDto>();

  // Output properties
  readonly handleShowDetails = output<string>();

  // Computed Signals
  protected readonly description = computed(() =>
    this.i18nService.useObjectTranslation(this.product().description),
  );
  protected readonly name = computed(() =>
    this.i18nService.useObjectTranslation(this.product().name),
  );
  protected readonly sourceSystemName = computed(() =>
    this.i18nService.useObjectTranslation(this.product().dataSourceSystem?.name),
  );
  protected readonly providerName = computed(() =>
    this.i18nService.useObjectTranslation(this.product().dataSourceSystem?.dataProvider.name),
  );
}
