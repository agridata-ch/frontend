import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  faBan,
  faCheckCircle,
  faCircleInfo,
  faWarning,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { ButtonComponent } from '@/shared/ui/button';

import { AlertComponent } from './alert.component';
import { AlertType } from './alert.model';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let componentRef: ComponentRef<AlertComponent>;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('message', 'Test message');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('alertIcon', () => {
    it('should return faCircleInfo for INFO', () => {
      componentRef.setInput('type', AlertType.INFO);
      fixture.detectChanges();

      expect(component['alertIcon']()).toBe(faCircleInfo);
    });

    it('should return faWarning for WARNING', () => {
      componentRef.setInput('type', AlertType.WARNING);
      fixture.detectChanges();

      expect(component['alertIcon']()).toBe(faWarning);
    });

    it('should return faBan for ERROR', () => {
      componentRef.setInput('type', AlertType.ERROR);
      fixture.detectChanges();

      expect(component['alertIcon']()).toBe(faBan);
    });

    it('should return faCheckCircle for SUCCESS', () => {
      componentRef.setInput('type', AlertType.SUCCESS);
      fixture.detectChanges();

      expect(component['alertIcon']()).toBe(faCheckCircle);
    });

    it('should return faCircleInfo for NEUTRAL', () => {
      componentRef.setInput('type', AlertType.NEUTRAL);
      fixture.detectChanges();

      expect(component['alertIcon']()).toBe(faCircleInfo);
    });
  });

  describe('closeAlert', () => {
    it('should emit true when close button is clicked', () => {
      jest.spyOn(component.closeAlert, 'emit');
      componentRef.setInput('showCloseButton', true);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
      const matchingButton = buttons.find((btn) =>
        btn.query(By.css('[aria-label="common.ariaLabel.close"]')),
      );
      matchingButton?.triggerEventHandler('handleClick', null);

      expect(component.closeAlert.emit).toHaveBeenCalledWith(true);
    });
  });
});
