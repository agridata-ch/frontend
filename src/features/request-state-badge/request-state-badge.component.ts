import { Component, Signal, computed, input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BadgeVariant, BadgeSize, BadgeComponent } from '@shared/ui/badge/badge.component';
import { formatDate } from '@/shared/lib/date-utils';

@Component({
  selector: 'request-state-badge',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './request-state-badge.component.html',
})
export class RequestStateBadgeComponent {
  readonly status = input<string>('');
  readonly lastStateChangeDate = input<string | undefined>(undefined);
  readonly size = input<BadgeSize>(BadgeSize.SM);

  readonly formattedDate = computed(() =>
    this.lastStateChangeDate() ? formatDate(new Date(this.lastStateChangeDate()!)) : '',
  );

  readonly badgeText: Signal<string> = computed(() => {
    const status = this.status();
    if (status === 'OPENED') return 'Offen';
    if (status === 'GRANTED')
      return this.formattedDate() ? `Eingewilligt am ${this.formattedDate()}` : 'Eingewilligt';
    if (status === 'DECLINED')
      return this.formattedDate() ? `Abgelehnt am ${this.formattedDate()}` : 'Abgelehnt';
    return 'Unknown';
  });

  readonly badgeVariant: Signal<BadgeVariant> = computed(() => {
    const status = this.status();
    if (status === 'OPENED') return BadgeVariant.INFO;
    if (status === 'GRANTED') return BadgeVariant.SUCCESS;
    if (status === 'DECLINED') return BadgeVariant.ERROR;
    return BadgeVariant.DEFAULT;
  });

  readonly badgeSize: Signal<BadgeSize> = computed(() => {
    return this.size() || BadgeSize.SM;
  });
}
