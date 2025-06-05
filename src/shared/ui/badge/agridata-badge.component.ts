import { Component, Signal, computed, input } from '@angular/core';

export enum BadgeVariant {
  DEFAULT = 'default',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

export enum BadgeSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

@Component({
  selector: 'app-agridata-badge',
  templateUrl: './agridata-badge.component.html',
})
export class AgridataBadgeComponent {
  readonly text = input<string>('');
  readonly variant = input<BadgeVariant>(BadgeVariant.DEFAULT);
  readonly size = input<BadgeSize>(BadgeSize.MD);

  readonly variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-cyan-100 text-cyan-700',
    warning: 'bg-yellow-200 text-yellow-800',
  };

  readonly sizeClasses: Record<BadgeSize, string> = {
    [BadgeSize.SM]: 'text-xs px-2 py-1 font-medium',
    [BadgeSize.MD]: 'text-sm px-2 py-1 font-medium',
    [BadgeSize.LG]: 'text-base px-2 py-1 font-medium',
  };

  readonly appliedClasses: Signal<string> = computed(() => {
    const base = 'inline-block font-medium rounded';
    const variantCl = this.variantClasses[this.variant()];
    const sizeCl = this.sizeClasses[this.size()];
    return `${base} ${variantCl} ${sizeCl}`;
  });
}
