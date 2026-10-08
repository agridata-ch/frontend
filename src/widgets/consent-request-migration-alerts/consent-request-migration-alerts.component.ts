import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestAggregationSummaryDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AlertComponent, AlertType } from '@/shared/ui/alert';

interface MigratedRequestGroup {
  consumerName: string;
  requests: ConsentRequestAggregationSummaryDto[];
}

interface MigrationSystem {
  id: string;
  flag: 'showStateAsMigratedFromMaf' | 'showStateAsMigratedFromTvd';
  introKey: string;
  titleKey: string;
}

interface MigrationInfo {
  id: string;
  introKey: string;
  titleKey: string;
  requests: ConsentRequestAggregationSummaryDto[];
  groups: MigratedRequestGroup[];
}

const MIGRATION_SYSTEMS: MigrationSystem[] = [
  {
    id: 'maf',
    flag: 'showStateAsMigratedFromMaf',
    introKey: 'migrationInfo.maf.intro',
    titleKey: 'migrationInfo.maf.title',
  },
  {
    id: 'tvd',
    flag: 'showStateAsMigratedFromTvd',
    introKey: 'migrationInfo.tvd.intro',
    titleKey: 'migrationInfo.tvd.title',
  },
];

/**
 * Displays dismissible alerts listing consent requests migrated from other systems (see
 * MIGRATION_SYSTEMS), grouped by consumer respectively.
 *
 * CommentLastReviewed: 2026-09-30
 */
@Component({
  selector: 'app-consent-request-migration-alerts',
  imports: [AlertComponent, I18nDirective, NgTemplateOutlet],
  templateUrl: './consent-request-migration-alerts.component.html',
})
export class ConsentRequestMigrationAlertsComponent {
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly i18nService = inject(I18nService);

  protected readonly AlertType = AlertType;

  readonly requests = input<ConsentRequestAggregationSummaryDto[]>([]);

  protected readonly migrationInfos = computed<MigrationInfo[]>(() => {
    const dismissedIds = this.dismissedMigrationIds();
    return MIGRATION_SYSTEMS.map(({ id, flag, introKey, titleKey }) => {
      const requests = this.requests().filter(
        (request) => request[flag] && !dismissedIds.has(request.id),
      );
      return { id, introKey, titleKey, requests, groups: this.groupByConsumer(requests) };
    }).filter((migrationInfo) => migrationInfo.requests.length > 0);
  });

  private readonly dismissedMigrationIds = computed<Set<string>>(() => {
    const storedIds = this.agridataStateService.userPreferences().dismissedMigratedIds;
    return storedIds ? new Set(storedIds) : new Set();
  });

  protected getMigratedRequestTitle(request: ConsentRequestAggregationSummaryDto): string {
    return this.i18nService.useObjectTranslation(request?.dataRequest?.title);
  }

  protected handleClose(migrationInfo: MigrationInfo): void {
    this.agridataStateService.addConfirmedMigratedUids(migrationInfo.requests.map((r) => r.id));
  }

  private getMigratedRequestConsumerName(request: ConsentRequestAggregationSummaryDto): string {
    return this.i18nService.useObjectTranslation(request?.dataRequest?.dataConsumerDisplayName);
  }

  private groupByConsumer(requests: ConsentRequestAggregationSummaryDto[]): MigratedRequestGroup[] {
    const groups = new Map<string, MigratedRequestGroup>();
    for (const request of requests) {
      const consumerName = this.getMigratedRequestConsumerName(request);
      const group = groups.get(consumerName) ?? { consumerName, requests: [] };
      group.requests.push(request);
      groups.set(consumerName, group);
    }
    return [...groups.values()];
  }
}
