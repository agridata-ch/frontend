import { Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircleInfo, faClose, faWarning } from '@fortawesome/free-solid-svg-icons';

import { AlertType } from './alert.model';

@Component({
  selector: 'app-alert',
  imports: [FontAwesomeModule],
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  readonly type = input<AlertType>(AlertType.NEUTRAL);
  readonly message = input<string>('');

  protected readonly AlertType = AlertType;
  protected readonly iconInfo = faCircleInfo;
  protected readonly iconWarning = faWarning;
  protected readonly iconError = faClose;
  protected readonly iconNeutral = faCircleInfo;
  protected readonly iconSuccess = faCheckCircle;

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
