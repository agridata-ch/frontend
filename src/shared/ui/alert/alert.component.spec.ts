import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircleInfo, faClose, faWarning } from '@fortawesome/free-solid-svg-icons';

import { AlertComponent } from './alert.component';
import { AlertType } from './alert.model';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let componentRef: ComponentRef<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the message provided as input', () => {
    const testMessage = 'Test alert message';
    componentRef.setInput('message', testMessage);
    fixture.detectChanges();

    const alertElement = fixture.debugElement.nativeElement;

    expect(alertElement.textContent).toContain(testMessage);
  });

  it('should have default type as NEUTRAL when no type is provided', () => {
    expect(component.type()).toBe(AlertType.NEUTRAL);
  });

  describe('alertIcon computed property', () => {
    it('should return iconInfo for AlertType.INFO', () => {
      componentRef.setInput('type', AlertType.INFO);
      fixture.detectChanges();

      const result = component['alertIcon']();

      expect(result).toBe(faCircleInfo);
    });

    it('should return iconWarning for AlertType.WARNING', () => {
      componentRef.setInput('type', AlertType.WARNING);
      fixture.detectChanges();

      const result = component['alertIcon']();

      expect(result).toBe(faWarning);
    });

    it('should return iconError for AlertType.ERROR', () => {
      componentRef.setInput('type', AlertType.ERROR);
      fixture.detectChanges();

      const result = component['alertIcon']();

      expect(result).toBe(faClose);
    });

    it('should return iconSuccess for AlertType.SUCCESS', () => {
      componentRef.setInput('type', AlertType.SUCCESS);
      fixture.detectChanges();

      const result = component['alertIcon']();

      expect(result).toBe(faCheckCircle);
    });

    it('should return iconNeutral for AlertType.NEUTRAL', () => {
      componentRef.setInput('type', AlertType.NEUTRAL);
      fixture.detectChanges();

      const result = component['alertIcon']();

      expect(result).toBe(faCircleInfo);
    });

    it('should default to iconNeutral when type is not set', () => {
      const result = component['alertIcon']();

      expect(result).toBe(faCircleInfo);
    });
  });
});
