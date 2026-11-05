import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestStateEnum } from '@/entities/openapi';
import { DataRequestStateBadgeComponent } from '@/shared/data-request';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { BadgeVariant } from '@/shared/ui/badge';

describe('DataRequestStateBadgeComponent', () => {
  let fixture: ComponentFixture<DataRequestStateBadgeComponent>;
  let component: DataRequestStateBadgeComponent;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataRequestStateBadgeComponent],
      providers: [{ provide: I18nService, useValue: i18nService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestStateBadgeComponent);
    component = fixture.componentInstance;
  });

  it('translates the state code and derives the variant', () => {
    fixture.componentRef.setInput('stateCode', DataRequestStateEnum.Active);

    expect(component['text']()).toBeDefined();
    expect(i18nService.translate).toHaveBeenCalledWith('data-request.stateCode.ACTIVE', {
      date: undefined,
    });
    expect(component['variant']()).toBe(BadgeVariant.SUCCESS);
  });

  it('passes the formatted notice period end for a pending termination', () => {
    fixture.componentRef.setInput('stateCode', DataRequestStateEnum.TerminationPending);
    fixture.componentRef.setInput('terminationPeriodUntil', '2027-01-14');

    component['text']();

    expect(i18nService.translate).toHaveBeenCalledWith(
      'data-request.stateCode.TERMINATION_PENDING',
      { date: '14.01.2027' },
    );
    expect(component['variant']()).toBe(BadgeVariant.WARNING);
  });

  it('derives the variant from the state code', () => {
    fixture.componentRef.setInput('stateCode', DataRequestStateEnum.Active);

    expect(component['variant']()).toBe(BadgeVariant.SUCCESS);
  });

  it('shows no text without a state code', () => {
    expect(component['text']()).toBe('');
  });
});
