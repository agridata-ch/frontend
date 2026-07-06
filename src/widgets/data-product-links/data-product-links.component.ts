import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  faAdd,
  faExternalLink,
  faTrashCan,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { LinkDto } from '@/entities/openapi';
import { CrossFieldGroupDirective } from '@/shared/forms/cross-field-group.directive';
import {
  crossFieldValidation,
  hasText,
  revalidateCrossFieldGroup,
} from '@/shared/forms/cross-field.validators';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { getFormArray, getFormControl, getFormControlWithMessages } from '@/shared/lib/form.helper';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ViewSectionDirective } from '@/shared/view-section';

import { absoluteUrlValidator, MAX_LINKS } from './data-product-links.validators';

/**
 * Manages the dynamic list of links for a data product. Rows can be added (up to five) and
 * removed. The editable rows are the schema-generated FormArray built by buildReactiveForm, so
 * standard rules (max length, item count) come from the schema. The sibling-dependent rules — both
 * fields required once one is filled, and the absolute-URL format — are feature logic attached to
 * the child controls so app-form-control renders the red/error state per field.
 *
 * CommentLastReviewed: 2026-07-08
 */
@Component({
  selector: 'app-data-product-links',
  imports: [
    ButtonComponent,
    CrossFieldGroupDirective,
    FontAwesomeModule,
    FormControlComponent,
    I18nDirective,
    ReactiveFormsModule,
    ViewSectionDirective,
  ],
  templateUrl: './data-product-links.component.html',
})
export class DataProductLinksComponent {
  // Injects
  private readonly i18n = inject(I18nService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly getFormControl = getFormControl;
  protected readonly faAdd = faAdd;
  protected readonly faLink = faExternalLink;
  protected readonly faTrashCan = faTrashCan;

  private readonly initializedGroups = new WeakSet<FormGroup>();

  // Input properties
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);

  // Signals
  private readonly linksVersion = signal(0);

  // Computed Signals
  // Return a fresh array on each recompute: FormArray.controls is mutated in place, so its
  // reference is stable and would defeat the default Object.is equality of downstream computeds.
  protected readonly linkGroups = computed<FormGroup[]>(() => {
    this.linksVersion();
    return [...(this.linksControl()?.controls ?? [])];
  });

  protected readonly canAdd = computed(() => this.linkGroups().length < MAX_LINKS);

  protected readonly viewLinks = computed<LinkDto[]>(() =>
    this.linkGroups()
      .map((group) => ({
        displayText: getFormControl(group, 'displayText').value,
        url: getFormControl(group, 'url').value,
      }))
      .filter((link) => hasText(link.displayText) && hasText(link.url)),
  );

  private readonly linksControl = computed(() => {
    const form = this.form();
    return form ? getFormArray(form, 'links') : undefined;
  });

  // Effects
  private readonly initEffect = effect(() => {
    const control = this.linksControl();
    if (!control?.buildItem) return;

    // Rows are created two ways: user-added via addLink, and async DTO hydration
    // (populateFormFromDto -> hydrateFormArray -> buildItem). Wrap buildItem so every row gets
    // its validators/messages at creation and bumps linksVersion, so both the read-only and the
    // editable lists recompute after async hydration without any RxJS subscription.
    const build = control.buildItem;
    control.buildItem = () => {
      const group = build();
      this.initLinkGroup(group);
      this.linksVersion.update((version) => version + 1);
      return group;
    };

    // Cover rows already present before this effect ran (populated before component init).
    for (const group of control.controls) {
      this.initLinkGroup(group);
    }
    this.linksVersion.update((version) => version + 1);
  });

  // Protected methods
  protected addLink(): void {
    const control = this.linksControl();

    if (!control?.buildItem || !this.canAdd()) return;

    // buildItem is wrapped in initEffect, so the new row is initialized and linksVersion bumped.
    control.push(control.buildItem());

    control.markAsDirty();
    control.updateValueAndValidity({ emitEvent: false });
  }

  protected removeLink(index: number): void {
    const control = this.linksControl();

    if (!control) return;

    control.removeAt(index);
    control.markAsDirty();
    control.updateValueAndValidity({ emitEvent: false });
    this.linksVersion.update((version) => version + 1);
  }

  // Private methods
  private initLinkGroup(group: FormGroup): void {
    if (this.initializedGroups.has(group)) return;

    this.initializedGroups.add(group);

    const displayText = getFormControlWithMessages(group, 'displayText');
    const url = getFormControlWithMessages(group, 'url');

    displayText.addValidators(crossFieldValidation);

    url.addValidators([crossFieldValidation, absoluteUrlValidator]);

    displayText.errorMessages = {
      ...displayText.errorMessages,
      required: () => this.i18n.translate('forms.error.required'),
    };

    url.errorMessages = {
      ...url.errorMessages,
      required: () => this.i18n.translate('forms.error.required'),
      absoluteUrl: () => this.i18n.translate('data-products.detailForm.links.url.error'),
    };

    // On-input revalidation is handled by CrossFieldGroupDirective in the template. This initial
    // call surfaces errors on rows that are already filled on load (async DTO hydration).
    revalidateCrossFieldGroup(group);
  }
}
