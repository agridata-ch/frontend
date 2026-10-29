import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AgbService } from '@/entities/api';
import { AgbTextDto } from '@/entities/openapi';
import { formatDate } from '@/shared/date';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { createFormControl, getFormControlWithMessages } from '@/shared/lib/form.helper';
import { ScrollFadeDirective } from '@/shared/scroll-fade';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataToggleComponent } from '@/shared/ui/agridata-toggle';
import { AlertComponent, AlertType } from '@/shared/ui/alert';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { ModalComponent } from '@/shared/ui/modal';
import { ViewSectionDirective } from '@/shared/view-section';

import { AGB_NEW_ID } from './admin-agb-form.model';
import { availableLangs } from '../../../transloco.config';

// TODO: take the max length from the BE schema (agridata-schemas.json) instead of hardcoding it
const AGB_TEXT_MAX_LENGTH = 50_000;

/**
 * Sidepanel for creating a new AGB revision (route id `new`) or viewing an existing one.
 * In view mode the revision is loaded by id and shown read-only.
 *
 * CommentLastReviewed: 2026-10-29
 */
@Component({
  selector: 'app-admin-agb-form',
  imports: [
    AgridataToggleComponent,
    AlertComponent,
    ButtonComponent,
    ErrorOutletComponent,
    FaIconComponent,
    FormControlComponent,
    I18nDirective,
    ModalComponent,
    ScrollFadeDirective,
    SidepanelComponent,
    ViewSectionDirective,
  ],
  templateUrl: './admin-agb-form.component.html',
})
export class AdminAgbFormComponent {
  // Injects
  private readonly agbService = inject(AgbService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly availableLangs = availableLangs;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly ControlTypes = ControlTypes;
  protected readonly today = new Date().toLocaleDateString('sv-SE'); // local yyyy-MM-dd
  protected readonly faSpinnerThird = faSpinnerThird;

  // Input properties
  readonly agbId = input<string>();

  // Signals
  protected readonly hasEnforceConsentDate = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly isPublishConfirmOpen = signal(false);
  protected readonly isPublishing = signal(false);

  // todo: adjust once the BE is ready --> agridata-schemas.json
  protected readonly form = new FormGroup({
    version: createFormControl('', [Validators.required], {
      required: () => this.i18nService.translate('admin-agbs.create.required'),
    }),
    enforceConsentFrom: createFormControl(
      '',
      [
        Validators.required,
        (control) => (control.value && control.value < this.today ? { min: true } : null),
      ],
      {
        required: () => this.i18nService.translate('admin-agbs.create.required'),
        min: () => this.i18nService.translate('admin-agbs.create.minToday'),
      },
    ),
    validFrom: createFormControl(''),
    validTo: createFormControl(''),
    agbText: new FormGroup(
      Object.fromEntries(
        availableLangs.map((lang) => [
          lang,
          createFormControl('', [Validators.required, Validators.maxLength(AGB_TEXT_MAX_LENGTH)], {
            required: () => this.i18nService.translate('admin-agbs.create.required'),
          }),
        ]),
      ),
    ),
  });

  protected readonly fetchAgbRevisionResource = resource({
    params: () => (this.isViewMode() ? this.agbId() : undefined),
    loader: ({ params }) => this.agbService.fetchAgbRevision(params),
  });

  // Computed Signals
  protected readonly isViewMode = computed(() => this.agbId() !== AGB_NEW_ID);

  protected readonly sidepanelTitle = computed(() =>
    this.i18nService.translate(
      this.isViewMode() ? 'admin-agbs.table.titleValue' : 'admin-agbs.form.title',
    ),
  );

  // Effects
  private readonly openAfterRender = afterNextRender(() => this.isOpen.set(true));

  // The date only takes part in validation while the toggle is on.
  private readonly syncConsentDateEffect = effect(() => {
    const control = this.form.controls.enforceConsentFrom;
    if (this.hasEnforceConsentDate()) control.enable();
    else control.disable();
  });

  private readonly fillFormEffect = effect(() => {
    const revision = this.fetchAgbRevisionResource.value();
    if (!revision) return;
    this.hasEnforceConsentDate.set(!!revision.enforceConsentFrom);
    this.form.patchValue({
      version: revision.version ?? '',
      validFrom: formatDate(revision.validFrom) ?? '',
      validTo: formatDate(revision.validTo) ?? '',
      enforceConsentFrom: formatDate(revision.enforceConsentFrom) ?? '',
      agbText: { ...revision.agbText },
    });
  });

  protected readonly fetchErrorHandler = createResourceErrorHandlerEffect(
    this.fetchAgbRevisionResource,
    this.errorService,
  );

  protected closeSidepanel(): void {
    void this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected getControl(path: string) {
    return getFormControlWithMessages(this.form, path);
  }

  // todo: adjust
  protected async confirmPublish(): Promise<void> {
    const { version, enforceConsentFrom, agbText } = this.form.getRawValue();
    const text: AgbTextDto = { de: agbText['de'], fr: agbText['fr'], it: agbText['it'] };
    this.isPublishing.set(true);
    const created = await this.agbService
      .createAgbRevision({
        version,
        agbText: text,
        ...(this.hasEnforceConsentDate() && {
          enforceConsentFrom: `${enforceConsentFrom}T00:00:00`,
        }),
      })
      .then(() => true)
      .catch((error) => {
        this.errorService.handleError(error);
        return false;
      });
    this.isPublishing.set(false);
    this.isPublishConfirmOpen.set(false);
    if (!created) return;
    this.toastService.show(
      this.i18nService.translate('admin-agbs.create.successTitle'),
      this.i18nService.translate('admin-agbs.create.successMessage', { version }),
      ToastType.Success,
    );
    this.closeSidepanel();
  }

  protected openPublishConfirm(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isPublishConfirmOpen.set(true);
  }
}
