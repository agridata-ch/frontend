import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestAggregationStateEnum, ConsentRequestStateEnum } from '@/entities/openapi';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { ConsentRequestStateBadgeComponent } from './consent-request-state-badge.component';

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

    expect(component['labelKey']()).toBe('consent-request.dataRequest.stateCode.OPENED');
  });

  it('falls back to the unknown label without a state', () => {
    expect(component['labelKey']()).toBe('consent-request.details.stateCode.UNKNOWN');
  });

  it.each([
    ConsentRequestStateEnum.Granted,
    ConsentRequestStateEnum.Declined,
    ConsentRequestStateEnum.LegallyPermitted,
    ConsentRequestAggregationStateEnum.PartiallyGranted,
  ])('shows the decision date tooltip for %s', (stateCode) => {
    fixture.componentRef.setInput('stateCode', stateCode);
    fixture.componentRef.setInput('lastStateChangeDate', '2026-10-01T10:00:00Z');

    expect(component['tooltip']()).toContain(`consent-request.details.stateCode.${stateCode}`);
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
