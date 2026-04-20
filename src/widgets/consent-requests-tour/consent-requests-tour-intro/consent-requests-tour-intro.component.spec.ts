import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { I18nService } from '@/shared/i18n';
import { ProductTourService } from '@/shared/product-tour/product-tour.service';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks/mock-i18n-service';
import {
  createMockProductTourService,
  MockProductTourService,
} from '@/shared/testing/mocks/mock-product-tour.service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ButtonComponent } from '@/shared/ui/button';

import { ConsentRequestsTourIntroComponent } from './consent-requests-tour-intro.component';

/**
 * Unit tests for ConsentRequestsTourIntroComponent
 *
 * CommentLastReviewed: 2026-03-02
 */
describe('ConsentRequestsTourIntroComponent', () => {
  let component: ConsentRequestsTourIntroComponent;
  let fixture: ComponentFixture<ConsentRequestsTourIntroComponent>;
  let productTourService: MockProductTourService;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    productTourService = createMockProductTourService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [ConsentRequestsTourIntroComponent, createTranslocoTestingModule()],
      providers: [
        { provide: ProductTourService, useValue: productTourService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestsTourIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the modal by default', () => {
    expect(component['showModal']()).toBe(true);
  });

  it('closeTourIntro() should hide the modal', () => {
    component['closeTourIntro']();
    expect(component['showModal']()).toBe(false);
  });

  it('startTour() should hide the modal and start the tour', () => {
    component['startTour']();

    expect(component['showModal']()).toBe(false);
    expect(productTourService.start).toHaveBeenCalledTimes(1);
    expect(productTourService.start).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should pass 3 steps when starting the tour', () => {
    component['startTour']();

    const steps = (productTourService.start as jest.Mock).mock.calls[0][0];
    expect(steps).toHaveLength(3);
  });

  it('skip button should close the modal without starting the tour', () => {
    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    // buttons[0] is the modal's own close button; skip is index 1
    const skipButton = buttons[1];
    skipButton.triggerEventHandler('handleClick', null);

    expect(component['showModal']()).toBe(false);
    expect(productTourService.start).not.toHaveBeenCalled();
  });

  it('start button should close the modal and start the tour', () => {
    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    // buttons[0] is the modal's own close button; start is index 2
    const startButton = buttons[2];
    startButton.triggerEventHandler('handleClick', null);

    expect(component['showModal']()).toBe(false);
    expect(productTourService.start).toHaveBeenCalledTimes(1);
  });
});
