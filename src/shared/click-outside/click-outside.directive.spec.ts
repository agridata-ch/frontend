import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  imports: [ClickOutsideDirective],
  template: `
    <div id="container" appClickOutside (appClickOutside)="onClickOutside($event)">
      <button id="inside">Inside</button>
    </div>
  `,
})
class TestHostComponent {
  onClickOutside = jest.fn();
}

describe('ClickOutsideDirective (standalone)', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let containerDe: DebugElement;
  let insideElement: HTMLElement;
  let outsideElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // attach host element to document so document:click events fire
    document.body.appendChild(fixture.nativeElement);

    containerDe = fixture.debugElement.query(By.css('#container'));
    insideElement = containerDe.nativeElement.querySelector('#inside');

    // create an outside element and attach it
    outsideElement = document.createElement('div');
    outsideElement.id = 'outside';
    document.body.appendChild(outsideElement);
  });

  afterEach(() => {
    document.body.removeChild(outsideElement);
    document.body.removeChild(fixture.nativeElement);
  });

  it('should not emit when clicking inside the host element', () => {
    insideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.onClickOutside).not.toHaveBeenCalled();
  });

  it('should emit when clicking outside the host element', () => {
    outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.onClickOutside).toHaveBeenCalledTimes(1);
    const eventArg = component.onClickOutside.mock.calls[0][0] as MouseEvent;
    expect(eventArg.type).toBe('click');
    expect(eventArg.target).toBe(outsideElement);
  });
});
