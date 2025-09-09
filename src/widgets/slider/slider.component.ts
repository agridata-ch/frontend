import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  ViewEncapsulation,
  computed,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * A reusable slider/carousel component for displaying CMS content
 *
 * CommentLastReviewed: 2025-09-15
 */
@Component({
  selector: 'app-slider',
  imports: [ButtonComponent, FontAwesomeModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class SliderComponent implements AfterViewInit {
  @ViewChild('sliderTrack') sliderTrack!: ElementRef;
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;

  protected readonly translateX = signal<number>(0);
  protected readonly slideCount = signal<number>(0);
  protected readonly currentIndex = signal<number>(0);
  protected readonly gap = signal<number>(16);
  protected readonly slidesPerPage = signal<number>(window.innerWidth >= 768 ? 2 : 1);

  protected readonly totalPages = computed(() =>
    Array(Math.ceil(this.slideCount() / this.slidesPerPage())),
  );

  protected readonly iconChevronRight = faChevronRight;
  protected readonly iconChevronLeft = faChevronLeft;
  protected readonly ButtonVariants = ButtonVariants;

  ngAfterViewInit() {
    this.slideCount.set(this.sliderTrack.nativeElement.children.length);
    this.updateSlidePosition();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateSlidePosition();
    this.slidesPerPage.set(window.innerWidth >= 768 ? 2 : 1);
  }

  private updateSlidePosition() {
    const containerWidth = this.sliderContainer.nativeElement.offsetWidth;
    this.translateX.set(-this.currentIndex() * containerWidth);
  }

  goPrev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((value) => value - 1);
      const containerWidth = this.sliderContainer.nativeElement.offsetWidth;
      this.translateX.update((value) => value + containerWidth + this.gap());
    }
  }

  goNext() {
    const slidesPerView = window.innerWidth >= 768 ? 2 : 1;
    if (this.currentIndex() < this.slideCount() - slidesPerView) {
      this.currentIndex.update((value) => value + 1);
      const containerWidth = this.sliderContainer.nativeElement.offsetWidth;
      this.translateX.update((value) => value - containerWidth - this.gap());
    }
  }
}
