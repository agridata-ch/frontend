import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  resource,
} from '@angular/core';
import { faShieldCheck } from '@awesome.me/kit-0b6d1ed528/icons/classic/solid';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataProductService } from '@/entities/api';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { AgridataLinksListComponent } from '@/shared/ui/links-list';
import { ModalComponent } from '@/shared/ui/modal';

/**
 * Read-only modal for a single public data product. Given a product id it fetches the product and
 * renders every field; emits a close request. The block only tells it which id is
 * selected — all detail loading lives here.
 *
 * CommentLastReviewed: 2026-09-02
 */
@Component({
  selector: 'app-public-data-product-detail',
  imports: [
    AgridataBadgeComponent,
    AgridataLinksListComponent,
    FontAwesomeModule,
    I18nDirective,
    ModalComponent,
  ],
  templateUrl: './public-data-product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicDataProductDetailComponent {
  // Injects
  private readonly dataProductService = inject(DataProductService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly BadgeSize = BadgeSize;
  protected readonly BadgeVariant = BadgeVariant;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly publicSectorIcon = faShieldCheck;

  // Input properties
  readonly productId = input<string | undefined>(undefined);

  // Output properties
  readonly handleClose = output<void>();

  // Resources
  protected readonly productResource = resource({
    params: () => ({ id: this.productId() }),
    loader: ({ params }) =>
      params.id
        ? this.dataProductService.getPublicProductById(params.id)
        : Promise.resolve(undefined),
  });

  // Computed signals
  protected readonly open = computed(() => !!this.productId());
  protected readonly loading = computed(() => this.productResource.isLoading());
  protected readonly product = computed(() => this.productResource.value());
  protected readonly name = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.name),
  );
  protected readonly description = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.description),
  );
  protected readonly extendedDescription = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.extendedDescription),
  );
  protected readonly providerName = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.dataSourceSystem?.dataProvider.name),
  );
  protected readonly sourceSystemName = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.dataSourceSystem?.name),
  );

  // Effects
  private readonly productErrorEffect = createResourceErrorHandlerEffect(
    this.productResource,
    this.errorService,
  );
  // A failed load surfaces a global error toast (above); close the modal so it doesn't linger empty.
  private readonly closeOnErrorEffect = effect(() => {
    if (this.productResource.error()) this.handleClose.emit();
  });
}
