import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AgridataWizardStepperComponent } from './agridata-wizard-stepper.component';

describe('AgridataWizardStepperComponent', () => {
  let component: AgridataWizardStepperComponent;
  let fixture: ComponentFixture<AgridataWizardStepperComponent>;
  let componentRef: ComponentRef<AgridataWizardStepperComponent>;

  const mockSteps = [
    { id: '1', label: 'Step 1', isValid: true },
    { id: '2', label: 'Step 2', isValid: false },
    { id: '3', label: 'Step 3', isValid: true },
  ];

  beforeEach(async () => {
    fixture = TestBed.createComponent(AgridataWizardStepperComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('steps', mockSteps);
    componentRef.setInput('currentStep', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the correct number of steps', () => {
    const stepButtons = fixture.debugElement.queryAll(By.css('.step-bubble'));
    expect(stepButtons.length).toBe(mockSteps.length);
  });

  it('should emit handleClickStep when a step is clicked', () => {
    jest.spyOn(component, 'handleClickStep');
    const stepButtons = fixture.debugElement.queryAll(By.css('.step-bubble'));
    stepButtons[2].nativeElement.click();
    expect(component.handleClickStep).toHaveBeenCalledWith(2);
  });
});
