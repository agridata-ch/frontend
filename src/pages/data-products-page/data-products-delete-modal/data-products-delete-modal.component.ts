import { Component, computed, inject, model, output, signal } from '@angular/core';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductService } from '@/entities/api/data-product.service';
import { DataProductDto, DataProductDtoStateCode } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { ToastService, ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal';

/**
 * Confirmation modal for deleting a draft data product. Opens as soon as a product is
 * set, performs the deletion itself and reports success so the owner can refresh its data.
 *
 * CommentLastReviewed: 2026-08-03
 */
@Component({
  selector: 'app-data-products-delete-modal',
  imports: [ButtonComponent, I18nDirective, ModalComponent],
  templateUrl: './data-products-delete-modal.component.html',
})
export class DataProductsDeleteModalComponent {
  // Injects
  private readonly dataProductService = inject(DataProductService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly stateService = inject(AgridataStateService);
  private readonly toastService = inject(ToastService);

  protected readonly ButtonVariants = ButtonVariants;

  readonly product = model<DataProductDto | null>(null);

  readonly handleDeleted = output<void>();

  protected readonly isDeleting = signal(false);

  protected readonly isOpen = computed(() => this.product() !== null);
  protected readonly productName = computed(() => {
    const product = this.product();
    if (!product) return '';
    return this.i18nService.useObjectTranslation(product.name);
  });

  protected cancelDelete(): void {
    this.product.set(null);
  }

  protected async deleteProduct(): Promise<void> {
    const product = this.product();
    if (!product?.id || product.stateCode !== DataProductDtoStateCode.Draft) {
      this.cancelDelete();
      return;
    }

    const productName = this.productName();
    this.isDeleting.set(true);

    await this.dataProductService
      .deleteDataProduct(product.id, this.stateService.actingRole())
      .then(() => {
        this.toastService.show(
          this.i18nService.translate('data-products.table.deleteProduct.success.title'),
          this.i18nService.translate('data-products.table.deleteProduct.success.message', {
            productName,
          }),
          ToastType.Success,
        );
        this.handleDeleted.emit();
      })
      .catch((error: Error) => {
        this.errorService.handleError(error);
      })
      .finally(() => {
        this.isDeleting.set(false);
        this.product.set(null);
      });
  }
}
