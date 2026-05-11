import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollFadeDirective } from './scroll-fade.directive';

@Component({
  imports: [ScrollFadeDirective],
  template: `
    <div id="scrollable" style="max-height: 100px; overflow-y: auto;" appScrollFade>
      <div style="height: 500px;"></div>
    </div>
  `,
})
class TestHostComponent {}

describe('ScrollFadeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the overlay div and wrap the host', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.relative');
    const overlay = wrapper?.querySelector('.bg-linear-to-b');

    expect(wrapper).toBeTruthy();
    expect(wrapper?.className).toBe('relative');
    expect(overlay).toBeTruthy();
    expect(overlay?.className).toContain('absolute');
    expect(overlay?.className).toContain('bottom-0');
  });

  it('should show overlay when not scrolled to bottom', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.relative');
    const overlay = wrapper?.querySelector('.bg-linear-to-b');

    expect(overlay?.classList.contains('hidden')).toBe(false);
  });

  it('should hide overlay when scrolled to bottom', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const scrollable = fixture.nativeElement.querySelector('#scrollable');
    scrollable.scrollTop = scrollable.scrollHeight - scrollable.clientHeight;
    scrollable.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.relative');
    const overlay = wrapper?.querySelector('.bg-linear-to-b');

    expect(overlay?.classList.contains('hidden')).toBe(true);
  });

  it('should show overlay when scrolled to top', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.relative');
    const overlay = wrapper?.querySelector('.bg-linear-to-b');

    expect(overlay?.classList.contains('hidden')).toBe(false);
  });

  it('should remove wrapper and overlay on destroy', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    let wrapper = fixture.nativeElement.querySelector('.relative');
    expect(wrapper).toBeTruthy();

    fixture.destroy();

    wrapper = fixture.nativeElement.querySelector('.relative');
    expect(wrapper).toBeFalsy();
  });
});
