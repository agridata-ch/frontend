import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataWizardComponent, WizardStep } from '@/widgets/agridata-wizard';

describe('AgridataWizardComponent', () => {
  let fixture: ComponentFixture<AgridataWizardComponent>;
  let component: AgridataWizardComponent;
  let compRef: ComponentRef<AgridataWizardComponent>;

  const mockSteps: WizardStep[] = [
    { id: '1', label: 'Step 1', isValid: true },
    { id: '2', label: 'Step 2', isValid: false },
    { id: '3', label: 'Step 3', isValid: true },
  ];

  beforeEach(async () => {
    fixture = TestBed.createComponent(AgridataWizardComponent);
    compRef = fixture.componentRef;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default currentStep = 0', () => {
    expect(component.currentStep()).toBe(0);
  });

  describe('nextStep()', () => {
    beforeEach(() => {
      compRef.setInput('steps', mockSteps);
      fixture.detectChanges();
    });

    it('increments currentStep by one until the last step', () => {
      expect(component.currentStep()).toBe(0);

      component.nextStep();
      expect(component.currentStep()).toBe(1);

      component.nextStep();
      expect(component.currentStep()).toBe(2);

      // at last step, nextStep does nothing
      component.nextStep();
      expect(component.currentStep()).toBe(2);
    });
  });

  describe('previousStep()', () => {
    beforeEach(() => {
      compRef.setInput('steps', mockSteps);
      fixture.detectChanges();
      component.currentStep.set(mockSteps.length - 1);
      expect(component.currentStep()).toBe(2);
    });

    it('decrements currentStep by one until zero', () => {
      component.previousStep();
      expect(component.currentStep()).toBe(1);

      component.previousStep();
      expect(component.currentStep()).toBe(0);

      // at zero, previousStep does nothing
      component.previousStep();
      expect(component.currentStep()).toBe(0);
    });
  });

  describe('handleChangeStep()', () => {
    beforeEach(() => {
      compRef.setInput('steps', mockSteps);
      fixture.detectChanges();
    });

    it('sets currentStep to a valid index', () => {
      component.handleChangeStep(2);
      expect(component.currentStep()).toBe(2);

      component.handleChangeStep(1);
      expect(component.currentStep()).toBe(1);
    });

    it('ignores negative or out-of-bounds indices', () => {
      component.handleChangeStep(1);
      expect(component.currentStep()).toBe(1);

      component.handleChangeStep(-1);
      expect(component.currentStep()).toBe(1);

      component.handleChangeStep(mockSteps.length);
      expect(component.currentStep()).toBe(1);
    });
  });
});
