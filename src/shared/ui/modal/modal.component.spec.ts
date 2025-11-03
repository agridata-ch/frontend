import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ButtonComponent } from '@/shared/ui/button';

import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;
  let component: ModalComponent;
  let componentRef: ComponentRef<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent, createTranslocoTestingModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display modal when open is false', () => {
    componentRef.setInput('open', false);
    fixture.detectChanges();

    const modalContainer = fixture.debugElement.query(By.css('.absolute.h-screen'));
    expect(modalContainer).toBeNull();
  });

  it('should display modal when open is true', () => {
    componentRef.setInput('open', true);
    fixture.detectChanges();

    const modalContainer = fixture.debugElement.query(By.css('.absolute.h-screen'));
    expect(modalContainer).not.toBeNull();
  });

  it('should display custom title', () => {
    const testTitle = 'test.modal.title';
    componentRef.setInput('open', true);
    componentRef.setInput('title', testTitle);
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('h3'));
    expect(titleElement.nativeElement.textContent).toContain(testTitle);
  });

  it('should display close button by default', () => {
    componentRef.setInput('open', true);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    expect(buttons.length).toBe(1);
  });

  it('should hide close button when showCloseButton is false', () => {
    componentRef.setInput('open', true);
    componentRef.setInput('showCloseButton', false);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    expect(buttons.length).toBe(0);
  });

  it('should close modal and emit closed event when close button is clicked', () => {
    componentRef.setInput('open', true);
    fixture.detectChanges();

    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    const closeButton = buttons[0];
    closeButton.triggerEventHandler('onClick', null);
    fixture.detectChanges();

    expect(component.open()).toBe(false);
    expect(closedSpy).toHaveBeenCalledWith(true);
  });

  it('should close modal when close method is called', () => {
    componentRef.setInput('open', true);
    fixture.detectChanges();

    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    component.close();
    fixture.detectChanges();

    expect(component.open()).toBe(false);
    expect(closedSpy).toHaveBeenCalledWith(true);
  });

  it('should project content into modal body', () => {
    const testContent = 'Test modal content';
    const fixtureWithContent = TestBed.createComponent(ModalComponent);
    const componentRefWithContent = fixtureWithContent.componentRef;

    componentRefWithContent.setInput('open', true);
    fixtureWithContent.nativeElement.innerHTML = testContent;
    fixtureWithContent.detectChanges();

    const modalBody = fixtureWithContent.debugElement.query(By.css('.overflow-y-auto'));
    expect(modalBody).not.toBeNull();
  });

  it('should have proper overlay styling for background', () => {
    componentRef.setInput('open', true);
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.css('.bg-gray-900\\/50'));
    expect(overlay).not.toBeNull();
    expect(overlay.nativeElement.classList.contains('z-50')).toBe(true);
  });

  it('should center modal content', () => {
    componentRef.setInput('open', true);
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.css('.absolute.h-screen'));
    expect(overlay.nativeElement.classList.contains('items-center')).toBe(true);
    expect(overlay.nativeElement.classList.contains('justify-center')).toBe(true);
  });
});
