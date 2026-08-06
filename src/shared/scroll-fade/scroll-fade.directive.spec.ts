import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollFadeDirective } from './scroll-fade.directive';

@Component({
  imports: [ScrollFadeDirective],
  template: `<div id="scrollable" appScrollFade></div>`,
})
class TestHostComponent {}

function mockScrollProps(
  el: HTMLElement,
  scrollHeight: number,
  clientHeight: number,
  scrollTop: number,
): void {
  Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
  Object.defineProperty(el, 'scrollTop', { value: scrollTop, configurable: true });
}

describe('ScrollFadeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.nativeElement.querySelector('#scrollable');
  });

  afterEach(() => {
    fixture.destroy();
  });

  async function setup(
    scrollHeight: number,
    clientHeight: number,
    scrollTop: number,
  ): Promise<void> {
    mockScrollProps(host, scrollHeight, clientHeight, scrollTop);
    fixture.detectChanges();
    await fixture.whenStable();
    host.dispatchEvent(new Event('scroll'));
  }

  it('should fade only the bottom when scrollable and at the top', async () => {
    await setup(500, 100, 0);
    expect(host.style.maskImage).toBe(
      'linear-gradient(to bottom, black 0, black calc(100% - 5rem), transparent 100%)',
    );
  });

  it('should fade both edges when scrolled somewhere in between', async () => {
    await setup(500, 100, 50);
    expect(host.style.maskImage).toBe(
      'linear-gradient(to bottom, transparent 0, black 2rem, black calc(100% - 5rem), transparent 100%)',
    );
  });

  it('should fade only the top when scrolled to bottom', async () => {
    // distanceToBottom = 500 - 398 - 100 = 2, condition is > 2, so the bottom fade hides
    await setup(500, 100, 398);
    expect(host.style.maskImage).toBe(
      'linear-gradient(to bottom, transparent 0, black 2rem, black 100%)',
    );
  });

  it('should clear mask when content is not scrollable', async () => {
    await setup(50, 100, 0);
    expect(host.style.maskImage).toBe('');
  });

  it('should update the mask while scrolling up and down', async () => {
    await setup(500, 100, 0);
    expect(host.style.maskImage).not.toContain('transparent 0');

    mockScrollProps(host, 500, 100, 398);
    host.dispatchEvent(new Event('scroll'));
    expect(host.style.maskImage).toContain('transparent 0');
    expect(host.style.maskImage).not.toContain('transparent 100%');

    mockScrollProps(host, 500, 100, 50);
    host.dispatchEvent(new Event('scroll'));
    expect(host.style.maskImage).toContain('transparent 0');
    expect(host.style.maskImage).toContain('transparent 100%');
  });

  it('should clear mask on destroy', async () => {
    await setup(500, 100, 0);
    expect(host.style.maskImage).toContain('linear-gradient');

    fixture.destroy();
    expect(host.style.maskImage).toBe('');
  });

  // Content is projected into the host after render (e.g. an accordion expanding), so the mask has
  // to be recalculated when children are added rather than only on scroll.
  it('should recalculate the mask when a child is added to the host', async () => {
    await setup(50, 100, 0);
    expect(host.style.maskImage).toBe('');

    mockScrollProps(host, 500, 100, 0);
    host.appendChild(document.createElement('div'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(host.style.maskImage).toContain('linear-gradient');
  });
});
