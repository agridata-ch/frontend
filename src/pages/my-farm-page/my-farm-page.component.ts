import { Component, computed, inject, resource } from '@angular/core';
import { faCopy, faFarm } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserService } from '@/entities/api/user.service';
import { AddressDto, FarmDto, FarmTypeEnum } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nService } from '@/shared/i18n';
import {
  createResourceErrorHandlerEffect,
  createResourceValueComputed,
} from '@/shared/lib/api.helper';
import { createCopyFeedback } from '@/shared/lib/copy-feedback.helper';
import { TooltipBubbleService } from '@/shared/tooltip';
import { ButtonComponent, ButtonSize, ButtonVariants } from '@/shared/ui/button';
import { UidMissingAlertComponent } from '@/widgets/uid-missing-alert';

const COPY_LABELS = { uid: 'UID', bur: 'BUR', ktIdB: 'KT_ID_B' } as const;

interface FarmField {
  key: keyof typeof COPY_LABELS;
  value: string;
}

interface FarmSection {
  /** Company name; farm cards use the translated farm type instead. */
  title: string;
  farmType?: FarmTypeEnum;
  address: string;
  fields: FarmField[];
}

function formatAddress(address?: AddressDto): string {
  if (!address) return '';
  const street =
    [address.street, address.houseNumber].filter(Boolean).join(' ') ||
    address.addressLine ||
    address.postOfficeBox;
  const town = [address.zipCode, address.town].filter(Boolean).join(' ');
  return [street, town].filter(Boolean).join(', ');
}

function farmFields(farm: FarmDto): FarmField[] {
  const fields: FarmField[] = [{ key: 'bur', value: farm.bur }];
  if (farm.ktIdB) fields.push({ key: 'ktIdB', value: farm.ktIdB });
  return fields;
}

/**
 * Producer page showing the active UID's company and its farms (BUR, KT_ID_B). With one farm or
 * none everything is shown in a single card; with several farms each farm gets its own card.
 * Every value and the whole overview can be copied to the clipboard.
 *
 * CommentLastReviewed: 2026-11-27
 */
@Component({
  selector: 'app-my-farm-page',
  imports: [
    ButtonComponent,
    ErrorOutletComponent,
    FontAwesomeModule,
    I18nDirective,
    UidMissingAlertComponent,
  ],
  templateUrl: './my-farm-page.component.html',
})
export class MyFarmPage {
  // Injects
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly bubbleService = inject(TooltipBubbleService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly userService = inject(UserService);

  // Constants
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faCopy = faCopy;
  protected readonly faFarm = faFarm;

  // Signals
  protected readonly copyFeedback = createCopyFeedback(
    this.bubbleService,
    this.i18nService,
    'my-farm',
  );
  protected readonly uidMissing = this.agridataStateService.uidMissing;

  private readonly farmOverviewResource = resource({
    params: () => {
      const uid = this.agridataStateService.activeUid();
      return uid && !this.agridataStateService.uidMissing()
        ? { uid, actingRole: this.agridataStateService.actingRole() }
        : undefined;
    },
    loader: ({ params }) => this.userService.getFarmOverview(params.uid, params.actingRole),
  });

  // Computed Signals
  private readonly farmOverview = createResourceValueComputed(this.farmOverviewResource, undefined);

  protected readonly sections = computed<FarmSection[]>(() => {
    const overview = this.farmOverview();
    if (!overview) return [];

    const { company, farms } = overview;
    const companySection: FarmSection = {
      title: company.name ?? '',
      address: formatAddress(company.address),
      fields: [{ key: 'uid', value: company.uid }],
    };

    if (farms.length <= 1) {
      companySection.fields.push(...farms.flatMap(farmFields));
      return [companySection];
    }

    return [
      companySection,
      ...farms.map((farm) => ({
        title: '',
        farmType: farm.farmTypeCode ?? FarmTypeEnum.Unknown,
        address: formatAddress(farm.address),
        fields: farmFields(farm),
      })),
    ];
  });

  // Effects
  private readonly farmOverviewErrorHandler = createResourceErrorHandlerEffect(
    this.farmOverviewResource,
    this.errorService,
  );

  protected copyAll(event: Event): void {
    const text = this.sections()
      .flatMap((section) => this.sectionLines(section))
      .join('\n');
    void this.copyFeedback.copy(text, event);
  }

  private sectionLines(section: FarmSection): string[] {
    const lines = section.fields.map((field) => `${COPY_LABELS[field.key]}: ${field.value}`);
    if (!section.farmType) return lines;

    const header = this.i18nService.translate(`my-farm.farmType.${section.farmType}`);
    return [`${header}:`, ...lines.map((line) => `  ${line}`)];
  }
}
