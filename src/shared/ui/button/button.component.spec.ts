import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit handleClick event on onButtonClick', () => {
    const clickSpy = jest.spyOn(component.handleClick, 'emit');
    const event = new MouseEvent('click');
    component.onButtonClick(event);
    expect(clickSpy).toHaveBeenCalled();
  });

  const getButton = (): HTMLButtonElement =>
    fixture.debugElement.query(By.css('button')).nativeElement;

  it('should be enabled when neither disabled nor loading', () => {
    expect(getButton().disabled).toBe(false);
  });

  it('should be disabled while loading even when disabled is false', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(getButton().disabled).toBe(true);
  });

  it('should show the success state when success is true and not loading', () => {
    fixture.componentRef.setInput('success', true);
    fixture.detectChanges();

    const button = getButton();
    expect(button.disabled).toBe(true);
    expect(button.classList).toContain('success');
    expect(fixture.debugElement.query(By.css('svg.success-check'))).toBeTruthy();
  });

  it('should let loading win over success', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('success', true);
    fixture.detectChanges();

    expect(getButton().classList).not.toContain('success');
    expect(fixture.debugElement.query(By.css('svg.success-check'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.loading-spinner, fa-icon'))).toBeTruthy();
  });
});
