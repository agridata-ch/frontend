import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  resource,
  signal,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { format } from 'date-fns';

import { AgbRevisionCreateDto as AgbRevisionCreateDtoSchema } from '@/assets/formSchemas/agridata-schemas.json';
import { AgbService } from '@/entities/api';
import { AgbTextDto, ExceptionEnum } from '@/entities/openapi';
import { formatDate } from '@/shared/date';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { getBackendErrorType } from '@/shared/error/http-error-method';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import {
  buildReactiveForm,
  flattenFormGroup,
  FormControlWithMessages,
  getFormControlWithMessages,
} from '@/shared/lib/form.helper';
import { ScrollFadeDirective } from '@/shared/scroll-fade';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataToggleComponent } from '@/shared/ui/agridata-toggle';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { ModalComponent } from '@/shared/ui/modal';
import { ViewSectionDirective } from '@/shared/view-section';

import { AGB_NEW_ID, agbFormsModel } from './admin-agb-form.model';
import { availableLangs } from '../../../transloco.config';

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
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Constants
  protected readonly availableLangs = availableLangs;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly ControlTypes = ControlTypes;
  protected readonly today = format(new Date(), 'yyyy-MM-dd'); // local date, <input type="date"> format
  protected readonly faSpinnerThird = faSpinnerThird;

  // Input properties
  readonly agbId = input<string>();

  // Signals
  protected readonly hasEnforceConsentDate = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly isPublishConfirmOpen = signal(false);
  protected readonly isPublishing = signal(false);

  protected readonly form = (() => {
    const form = buildReactiveForm(AgbRevisionCreateDtoSchema, agbFormsModel, this.i18nService);
    const addRequired = (control: FormControlWithMessages) => {
      control.addValidators(Validators.required);
      control.errorMessages = {
        ...control.errorMessages,
        required: () => this.i18nService.translate('forms.error.required'),
      };
    };
    // The schema only marks `agbText` itself as required, the form needs every field.
    const version = getFormControlWithMessages(form, 'version');
    addRequired(version);
    version.errorMessages = {
      ...version.errorMessages,
      versionAlreadyExists: () =>
        this.i18nService.translate('admin-agbs.create.error.versionAlreadyExists'),
      versionNotNewer: () => this.i18nService.translate('admin-agbs.create.error.versionNotNewer'),
    };
    for (const lang of availableLangs) {
      addRequired(getFormControlWithMessages(form, `agbText.${lang}`));
    }

    const consentDate = getFormControlWithMessages(form, 'enforceConsentFrom');
    addRequired(consentDate);
    consentDate.addValidators((control) =>
      control.value && control.value < this.today ? { min: true } : null,
    );
    consentDate.errorMessages = {
      ...consentDate.errorMessages,
      min: () => this.i18nService.translate('admin-agbs.create.minToday'),
    };
    return form;
  })();

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

  protected readonly validityLabel = computed(() => {
    const revision = this.fetchAgbRevisionResource.value();
    const from = formatDate(revision?.validFrom) ?? '';
    const to = formatDate(revision?.validTo);
    return to
      ? `${from} - ${to}`
      : this.i18nService.translate('admin-agbs.validity.openEnded', { date: from });
  });

  // Effects
  private readonly openAfterRender = afterNextRender(() => this.isOpen.set(true));

  // The date only takes part in validation while the toggle is on.
  private readonly syncConsentDateEffect = effect(() => {
    const control = this.getControl('enforceConsentFrom');
    if (this.hasEnforceConsentDate()) control.enable();
    else control.disable();
  });

  private readonly fillFormEffect = effect(() => {
    const revision = this.fetchAgbRevisionResource.value();
    if (!revision) return;
    this.hasEnforceConsentDate.set(!!revision.enforceConsentFrom);
    this.form.patchValue({
      version: revision.version ?? '',
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

  protected async confirmPublish(): Promise<void> {
    const { version, enforceConsentFrom, agbText } = flattenFormGroup<{
      version: string;
      enforceConsentFrom: string;
      agbText: AgbTextDto;
    }>(this.form, false);
    this.isPublishing.set(true);
    const created = await this.agbService
      .createAgbRevision({
        version,
        agbText,
        ...(this.hasEnforceConsentDate() && {
          enforceConsentFrom: `${enforceConsentFrom}T00:00:00`,
        }),
      })
      .then(() => true)
      .catch((error: Error | HttpErrorResponse) => {
        this.handlePublishError(error);
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

  private handlePublishError(error: Error | HttpErrorResponse): void {
    const versionControl = this.getControl('version');
    switch (getBackendErrorType(error)) {
      case ExceptionEnum.AgbVersionAlreadyExists:
        versionControl.setErrors({ versionAlreadyExists: true });
        versionControl.markAsTouched();
        this.scrollToError();
        break;
      case ExceptionEnum.AgbVersionNotNewer:
        versionControl.setErrors({ versionNotNewer: true });
        versionControl.markAsTouched();
        this.scrollToError();
        break;
      default:
        this.errorService.handleError(error);
    }
  }

  /** Scrolls the sidepanel up to the field showing the backend error, once it is rendered. */
  private scrollToError(): void {
    afterNextRender(
      () =>
        this.elementRef.nativeElement
          .querySelector('app-form-control.has-error')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      { injector: this.injector },
    );
  }
}
