import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { faChevronDown, faChevronUp } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TooltipDirective } from '@/shared/tooltip';

export enum ACCORDION_SKIN {
  DEFAULT = 'default',
  PUBLIC = 'public',
}

/**
 * Implements the accordion logic and behavior. It manages expansion state, toggles open/closed on
 * click or keyboard input, and updates the displayed icon accordingly.
 *
 * CommentLastReviewed: 2025-09-22
 */
@Component({
  selector: 'app-agridata-accordion',
  imports: [FontAwesomeModule, TooltipDirective],
  templateUrl: './agridata-accordion.component.html',
})
export class AgridataAccordionComponent implements AfterViewInit {
  // ViewChilds
  @ViewChild('contentWrapper') contentWrapper?: ElementRef;
  @ViewChild('contentInner') contentInner?: ElementRef;

  // Constants
  protected readonly ACCORDION_SKIN = ACCORDION_SKIN;

  // Inputs
  readonly header = input<string>('');
  readonly skin = input<ACCORDION_SKIN>(ACCORDION_SKIN.DEFAULT);

  // Signals
  protected readonly isExpanded = signal<boolean>(false);

  protected readonly expandIcon = computed(() => (this.isExpanded() ? faChevronUp : faChevronDown));

  ngAfterViewInit() {
    this.updateContentHeight();
  }

  protected toggleAccordion() {
    if (this.isExpanded()) {
      const height = this.contentInner?.nativeElement.offsetHeight ?? 0;
      if (this.contentWrapper) {
        this.contentWrapper.nativeElement.style.height = `${height}px`;
      }

      this.addTransitionEndHandler(() => {
        this.isExpanded.set(false);
      });

      setTimeout(() => {
        if (this.contentWrapper) {
          this.contentWrapper.nativeElement.style.height = '0px';
        }
      }, 0);
    } else {
      this.isExpanded.set(true);

      requestAnimationFrame(() => {
        const height = this.contentInner?.nativeElement.offsetHeight ?? 0;
        if (this.contentWrapper) {
          this.contentWrapper.nativeElement.style.height = `${height}px`;

          this.addTransitionEndHandler(() => {
            if (this.contentWrapper) {
              this.contentWrapper.nativeElement.style.height = 'auto';
            }
          });
        }
      });
    }
  }

  private addTransitionEndHandler(callback: () => void) {
    if (!this.contentWrapper) return;
    const wrapper = this.contentWrapper.nativeElement;
    const onTransitionEnd = () => {
      callback();
      wrapper.removeEventListener('transitionend', onTransitionEnd);
    };
    wrapper.addEventListener('transitionend', onTransitionEnd);
  }

  protected updateContentHeight() {
    if (this.contentInner && this.isExpanded()) {
      const height = this.contentInner.nativeElement.offsetHeight;
      if (this.contentWrapper) {
        this.contentWrapper.nativeElement.style.height = this.isExpanded() ? `${height}px` : '0px';
      }
    }
  }
}
