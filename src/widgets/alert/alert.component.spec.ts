import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ButtonComponent } from '@/shared/ui/button';

import { AlertComponent } from './alert.component';
import { AlertType } from './alert.model';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent, FontAwesomeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Alert Types', () => {
    it('should apply success styling when type is SUCCESS', () => {
      fixture.componentRef.setInput('type', AlertType.SUCCESS);
      fixture.detectChanges();

      const alertDiv = fixture.debugElement.query(By.css('div'));
      expect(alertDiv.nativeElement.classList).toContain('bg-green-100');
      expect(alertDiv.nativeElement.classList).toContain('text-green-700');
    });

    it('should apply error styling when type is ERROR', () => {
      fixture.componentRef.setInput('type', AlertType.ERROR);
      fixture.detectChanges();

      const alertDiv = fixture.debugElement.query(By.css('div'));
      expect(alertDiv.nativeElement.classList).toContain('bg-red-100');
      expect(alertDiv.nativeElement.classList).toContain('text-red-700');
    });
  });

  describe('Close Button', () => {
    it('should show close button when showCloseButton is true', () => {
      fixture.componentRef.setInput('showCloseButton', true);
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(
        By.css('[aria-label="common.ariaLabel.close"]'),
      );
      expect(closeButton).toBeTruthy();
    });

    it('should hide close button when showCloseButton is false', () => {
      fixture.componentRef.setInput('showCloseButton', false);
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(
        By.css('[aria-label="common.ariaLabel.close"]'),
      );
      expect(closeButton).toBeFalsy();
    });

    it('should emit closeAlert when close button is clicked', () => {
      jest.spyOn(component.closeAlert, 'emit');
      fixture.componentRef.setInput('showCloseButton', true);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));

      const matchingButton = buttons.find((btn) =>
        btn.query(By.css('[aria-label="common.ariaLabel.close"]')),
      );
      matchingButton?.triggerEventHandler('onClick', null);

      expect(component.closeAlert.emit).toHaveBeenCalledWith(true);
    });
  });
});
