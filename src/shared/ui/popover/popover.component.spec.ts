import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverComponent } from './popover.component';

@Component({
  template: ` <app-popover [open]="isOpen" class="test-class"
    ><span class="test-content">Popover Content</span></app-popover
  >`,
  standalone: true,
  imports: [PopoverComponent],
})
class TestHostComponent {
  @Input() isOpen = false;
}

describe('PopoverComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let popoverElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent], // standalone host
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    popoverElement = fixture.nativeElement.querySelector('.popover');
  });

  it('should render projected content', () => {
    expect(popoverElement.querySelector('.test-content')?.textContent).toContain('Popover Content');
  });

  it('should have closed state classes by default', () => {
    expect(popoverElement.classList).toContain('scale-y-0');
    expect(popoverElement.classList).toContain('opacity-0');
    expect(popoverElement.classList).toContain('pointer-events-none');
  });

  it('should have open state classes when open is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    expect(popoverElement.classList).toContain('popup-animate-in');
    expect(popoverElement.classList).toContain('scale-y-100');
    expect(popoverElement.classList).toContain('opacity-100');
    expect(popoverElement.classList).toContain('pointer-events-auto');
  });

  it('should include custom class from [class] input', () => {
    expect(popoverElement.classList).toContain('test-class');
  });
});
