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

  it('should apply gradient mask when scrollable and not at bottom', async () => {
    await setup(500, 100, 0);
    expect(host.style.maskImage).toContain('linear-gradient');
  });

  it('should clear mask when content is not scrollable', async () => {
    await setup(50, 100, 0);
    expect(host.style.maskImage).toBe('');
  });

  it('should clear mask when scrolled to bottom', async () => {
    // distanceToBottom = 500 - 398 - 100 = 2, condition is > 2, so fade hides
    await setup(500, 100, 398);
    expect(host.style.maskImage).toBe('');
  });

  it('should restore gradient mask when scrolled back up from bottom', async () => {
    await setup(500, 100, 0);
    expect(host.style.maskImage).toContain('linear-gradient');

    mockScrollProps(host, 500, 100, 398);
    host.dispatchEvent(new Event('scroll'));
    expect(host.style.maskImage).toBe('');

    mockScrollProps(host, 500, 100, 50);
    host.dispatchEvent(new Event('scroll'));
    expect(host.style.maskImage).toContain('linear-gradient');
  });

  it('should clear mask on destroy', async () => {
    await setup(500, 100, 0);
    expect(host.style.maskImage).toContain('linear-gradient');

    fixture.destroy();
    expect(host.style.maskImage).toBe('');
  });
});
