import { Component, computed, inject, input, output } from '@angular/core';
import {
  faDownload,
  faRotateLeft,
  faTrashCan,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { I18nService } from '@/shared/i18n';
import { AgridataBadgeComponent, BadgeVariant } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants, IconPosition } from '@/shared/ui/button';
import { formatBytes, getFileIcon } from '@/shared/utils';

/**
 * Presentational row for a single file. Renders a file icon and name on the left
 * (clickable to open the file when downloadable) and, on the right, an optional status
 * badge, download button and remove button. The file icon is derived from the file name.
 *
 * It owns no data fetching: it emits handleOpen / handleDownload / handleRemove and
 * receives loading state via inputs, so each consumer keeps its own service logic.
 *
 * CommentLastReviewed: 2026-07-13
 */
@Component({
  selector: 'app-agridata-file-download',
  templateUrl: './agridata-file-download.component.html',
  imports: [AgridataBadgeComponent, ButtonComponent, FontAwesomeModule],
  host: { class: 'flex w-full items-center justify-between gap-3' },
})
export class AgridataFileDownloadComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly IconPosition = IconPosition;
  protected readonly faDownload = faDownload;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faTrashCan = faTrashCan;
  protected readonly formatBytes = formatBytes;

  // Inputs
  readonly fileName = input.required<string>();
  readonly sizeBytes = input<number>();
  readonly isOpening = input<boolean>(false);
  readonly downloadable = input<boolean>(false);
  readonly isDownloading = input<boolean>(false);
  readonly downloadLabel = input<string>();
  readonly removable = input<boolean>(false);
  readonly markedForRemoval = input<boolean>(false);
  readonly badgeText = input<string>();
  readonly badgeVariant = input<BadgeVariant>(BadgeVariant.DEFAULT);

  // Outputs
  readonly handleOpen = output<void>();
  readonly handleDownload = output<void>();
  readonly handleRemove = output<void>();
  readonly handleRestore = output<void>();

  // Computed
  protected readonly fileIcon = computed(() => getFileIcon(this.fileName()));
  protected readonly downloadAriaLabel = computed(() =>
    this.i18nService.translate('fileDownload.download', { fileName: this.fileName() }),
  );
  protected readonly removeAriaLabel = computed(() =>
    this.i18nService.translate('fileDownload.remove', { fileName: this.fileName() }),
  );
  protected readonly restoreAriaLabel = computed(() =>
    this.i18nService.translate('fileDownload.restore', { fileName: this.fileName() }),
  );
}
