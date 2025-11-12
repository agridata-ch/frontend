import { Component, computed, input, output } from '@angular/core';
import {
  faBan,
  faCheckCircle,
  faCircleInfo,
  faClose,
  faWarning,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

import { AlertType } from './alert.model';

/**
 * Implements the alert’s logic and rendering. It accepts the type and message as inputs, dynamically
 * selects the appropriate icon, and applies consistent styling for each alert type. It leverages
 * Angular signals and FontAwesome for responsive UI updates and icons.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-alert',
  imports: [FontAwesomeModule, ButtonComponent],
  templateUrl: './alert.component.html',
  host: { class: 'block' },
})
export class AlertComponent {
  protected readonly closeIcon = faClose;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly AlertType = AlertType;
  protected readonly iconInfo = faCircleInfo;
  protected readonly iconWarning = faWarning;
  protected readonly iconError = faBan;
  protected readonly iconNeutral = faCircleInfo;
  protected readonly iconSuccess = faCheckCircle;

  readonly type = input<AlertType>(AlertType.NEUTRAL);
  readonly showCloseButton = input<boolean>(false);
  readonly closeAlert = output<boolean>();

  protected readonly alertIcon = computed(() => {
    switch (this.type()) {
      case AlertType.INFO:
        return this.iconInfo;
      case AlertType.WARNING:
        return this.iconWarning;
      case AlertType.ERROR:
        return this.iconError;
      case AlertType.SUCCESS:
        return this.iconSuccess;
      case AlertType.NEUTRAL:
        return this.iconNeutral;
    }
  });
}
