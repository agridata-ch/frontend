import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestAggregationStateEnum, ConsentRequestStateEnum } from '@/entities/openapi';
import { ConsentRequestStateBadgeComponent } from '@/shared/consent-request';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { BadgeVariant } from '@/shared/ui/badge';

describe('ConsentRequestStateBadgeComponent', () => {
  let fixture: ComponentFixture<ConsentRequestStateBadgeComponent>;
  let component: ConsentRequestStateBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ConsentRequestStateBadgeComponent,
        createTranslocoTestingModule({ langs: { de: {} } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestStateBadgeComponent);
    component = fixture.componentInstance;
  });

  it('uses the state label key', () => {
    fixture.componentRef.setInput('stateCode', ConsentRequestStateEnum.Opened);

    expect(component['text']()).toBe('consent-request.stateCode.OPENED');
  });

  it('falls back to the unknown label without a state', () => {
    expect(component['text']()).toBe('consent-request.stateCode.UNKNOWN');
  });

  it.each([
    ConsentRequestStateEnum.Granted,
    ConsentRequestStateEnum.Declined,
    ConsentRequestStateEnum.LegallyPermitted,
    ConsentRequestAggregationStateEnum.PartiallyGranted,
  ])('shows the decision date tooltip for %s', (stateCode) => {
    fixture.componentRef.setInput('stateCode', stateCode);
    fixture.componentRef.setInput('lastStateChangeDate', '2026-10-01T10:00:00Z');

    expect(component['tooltip']()).toContain(`consent-request.stateCode.tooltip.${stateCode}`);
  });

  it.each([
    undefined,
    ConsentRequestStateEnum.Opened,
    ConsentRequestAggregationStateEnum.PartiallyOpened,
  ])('shows no tooltip for %s', (stateCode) => {
    fixture.componentRef.setInput('stateCode', stateCode);
    fixture.componentRef.setInput('lastStateChangeDate', '2026-10-01T10:00:00Z');

    expect(component['tooltip']()).toBe('');
  });

  it('shows no tooltip for a dated state without a date', () => {
    fixture.componentRef.setInput('stateCode', ConsentRequestStateEnum.Granted);

    expect(component['tooltip']()).toBe('');
  });

  it('derives the variant from the state code', () => {
    fixture.componentRef.setInput('stateCode', ConsentRequestStateEnum.Granted);

    expect(component['variant']()).toBe(BadgeVariant.SUCCESS);
  });

  describe('accessibility attributes', () => {
    it('makes the badge focusable and labelled when it has a tooltip', () => {
      fixture.componentRef.setInput('stateCode', ConsentRequestStateEnum.Granted);
      fixture.componentRef.setInput('lastStateChangeDate', '2026-10-01T10:00:00Z');
      fixture.detectChanges();

      const wrapper: HTMLElement = fixture.nativeElement.querySelector('span');
      expect(wrapper.getAttribute('tabindex')).toBe('0');
      expect(wrapper.getAttribute('aria-label')).toBe(component['tooltip']());
    });

    it('adds no tabindex or aria-label without a tooltip', () => {
      fixture.componentRef.setInput('stateCode', ConsentRequestStateEnum.Opened);
      fixture.detectChanges();

      const wrapper: HTMLElement = fixture.nativeElement.querySelector('span');
      expect(wrapper.hasAttribute('tabindex')).toBe(false);
      expect(wrapper.hasAttribute('aria-label')).toBe(false);
    });
  });
});
