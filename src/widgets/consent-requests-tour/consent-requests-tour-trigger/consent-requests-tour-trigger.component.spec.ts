import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { Mock } from 'vitest';

import { I18nService } from '@/shared/i18n';
import { ProductTourService } from '@/shared/product-tour';
import {
  createMockI18nService,
  MockI18nService,
  createMockProductTourService,
  MockProductTourService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ButtonComponent } from '@/shared/ui/button';

import { ConsentRequestsTourTriggerComponent } from './consent-requests-tour-trigger.component';

/**
 * Unit tests for ConsentRequestsTourTriggerComponent
 *
 * CommentLastReviewed: 2026-03-02
 */
describe('ConsentRequestsTourTriggerComponent', () => {
  let component: ConsentRequestsTourTriggerComponent;
  let fixture: ComponentFixture<ConsentRequestsTourTriggerComponent>;
  let productTourService: MockProductTourService;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    productTourService = createMockProductTourService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [ConsentRequestsTourTriggerComponent, createTranslocoTestingModule()],
      providers: [
        { provide: ProductTourService, useValue: productTourService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestsTourTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call productTourService.start() when startTour() is called', () => {
    component['startTour']();

    expect(productTourService.start).toHaveBeenCalledTimes(1);
    expect(productTourService.start).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should start the tour when the trigger button is clicked', () => {
    const button = fixture.debugElement.query(By.directive(ButtonComponent));
    button.triggerEventHandler('handleClick', null);

    expect(productTourService.start).toHaveBeenCalledTimes(1);
  });

  it('should pass 4 steps to productTourService.start()', () => {
    component['startTour']();

    const steps = (productTourService.start as Mock).mock.calls[0][0];
    expect(steps).toHaveLength(4);
  });
});
