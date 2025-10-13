import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderComponent } from './slider.component';

describe('SliderComponent', () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;
  let sliderTrackEl: HTMLElement;
  let sliderContainerEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SliderComponent);
    component = fixture.componentInstance;

    // Mock slider track and container elements
    sliderTrackEl = document.createElement('div');
    sliderContainerEl = document.createElement('div');

    // Add mock slides to the track
    for (let i = 0; i < 4; i++) {
      const slide = document.createElement('div');
      sliderTrackEl.appendChild(slide);
    }

    // Set up container with fixed width
    Object.defineProperty(sliderContainerEl, 'offsetWidth', { value: 400 });

    // Set up references in the component
    component.sliderTrack = { nativeElement: sliderTrackEl } as ElementRef;
    component.sliderContainer = { nativeElement: sliderContainerEl } as ElementRef;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize slider after view init', () => {
    const mockChildren = Array(4).fill({});
    jest
      .spyOn(component.sliderTrack.nativeElement, 'children', 'get')
      .mockReturnValue(mockChildren);

    component.ngAfterViewInit();
    fixture.detectChanges();
    expect(component['slideCount']()).toBe(4);
  });

  it('should update slides per page on window resize', () => {
    // mobile view
    Object.defineProperty(window, 'innerWidth', { value: 600 });
    component.onResize();
    expect(component['slidesPerPage']()).toBe(1);

    // desktop view
    Object.defineProperty(window, 'innerWidth', { value: 800 });
    component.onResize();
    expect(component['slidesPerPage']()).toBe(2);
  });

  it('should calculate total pages correctly', () => {
    component['slideCount'].set(4);
    component['slidesPerPage'].set(2);
    expect(component['totalPages']().length).toBe(2);

    component['slidesPerPage'].set(1);
    expect(component['totalPages']().length).toBe(4);
  });

  it('should not go to previous slide when at first slide', () => {
    component['currentIndex'].set(0);
    component.goPrev();
    expect(component['currentIndex']()).toBe(0);
  });

  it('should go to previous slide when not at first slide', () => {
    component['currentIndex'].set(1);
    component.goPrev();
    expect(component['currentIndex']()).toBe(0);
  });

  it('should not go to next slide when at last slide', () => {
    component['slideCount'].set(4);
    component['currentIndex'].set(3);

    // mobile view - 1 slide per view
    Object.defineProperty(window, 'innerWidth', { value: 600 });

    const initialIndex = component['currentIndex']();
    component.goNext();
    expect(component['currentIndex']()).toBe(initialIndex);
  });

  it('should go to next slide when not at last slide', () => {
    component['slideCount'].set(4);
    component['currentIndex'].set(0);

    component.goNext();
    expect(component['currentIndex']()).toBe(1);
  });

  it('should calculate slidesPerView in goNext based on window width', () => {
    component['slideCount'].set(4);

    // desktop width (2 slides per view)
    Object.defineProperty(window, 'innerWidth', { value: 800 });
    component['currentIndex'].set(2);
    component.goNext();
    expect(component['currentIndex']()).toBe(2);

    // mobile width (1 slide per view)
    Object.defineProperty(window, 'innerWidth', { value: 600 });
    component['currentIndex'].set(2);
    component.goNext();
    expect(component['currentIndex']()).toBe(3);
  });
});
