import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AgbModalService } from '@/features/agb-modal';
import { formatDate } from '@/shared/date';
import { I18nService } from '@/shared/i18n';
import {
  createMockAgbModalService,
  createMockI18nService,
  MockAgbModalService,
  MockI18nService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ButtonComponent } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal/modal.component';

import { AgbModalComponent } from './agb-modal.component';

/**
 * Unit tests for AgbModalComponent
 *
 * CommentLastReviewed: 2026-07-28
 */
describe('AgbModalComponent', () => {
  let fixture: ComponentFixture<AgbModalComponent>;
  let component: AgbModalComponent;
  let agbModalService: MockAgbModalService;
  let i18nService: MockI18nService;

  const ENFORCE_FROM = '2026-01-01T00:00:00Z';

  beforeEach(async () => {
    agbModalService = createMockAgbModalService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [AgbModalComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AgbModalService, useValue: agbModalService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgbModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('delegation', () => {
    it('should delegate accept() to the service', () => {
      component['accept']();

      expect(agbModalService.accept).toHaveBeenCalledTimes(1);
    });

    it('should delegate dismiss() to the service', () => {
      component['dismiss']();

      expect(agbModalService.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('info text branch selection', () => {
    it('should use the deadline info key when skippable and an enforce date is set', () => {
      agbModalService.__testSignals.isSkippable.set(true);
      agbModalService.__testSignals.enforceConsentFrom.set(ENFORCE_FROM);

      expect(component['deadlineInfoParts']().before).toBe('agb.modal.deadlineInfo');
      expect(i18nService.translate).toHaveBeenCalledWith('agb.modal.deadlineInfo', {
        enforceConsentFrom: formatDate(ENFORCE_FROM),
      });
    });

    it('should fall back to the updated info key when skippable without an enforce date', () => {
      agbModalService.__testSignals.isSkippable.set(true);
      agbModalService.__testSignals.enforceConsentFrom.set(undefined);

      expect(component['deadlineInfoParts']().before).toBe('agb.modal.updatedInfo');
    });

    it('should use the updated info key for a returning user who accepted a previous AGB', () => {
      agbModalService.__testSignals.hasAcceptedPreviousAgb.set(true);

      expect(component['generalAgbInfoparts']().before).toBe('agb.modal.updatedInfo');
    });

    it('should use the general info key for a first-time user', () => {
      agbModalService.__testSignals.hasAcceptedPreviousAgb.set(false);
      agbModalService.__testSignals.enforceConsentFrom.set(ENFORCE_FROM);

      expect(component['generalAgbInfoparts']().before).toBe('agb.modal.generalInfo');
      expect(i18nService.translate).toHaveBeenCalledWith('agb.modal.generalInfo', {
        enforceConsentFrom: formatDate(ENFORCE_FROM),
      });
    });

    it('should use the blocking info key for the enforced info text', () => {
      agbModalService.__testSignals.enforceConsentFrom.set(ENFORCE_FROM);

      expect(component['enforcedInfoParts']().before).toBe('agb.modal.blockingInfo');
      expect(i18nService.translate).toHaveBeenCalledWith('agb.modal.blockingInfo', {
        enforceConsentFrom: formatDate(ENFORCE_FROM),
      });
    });
  });

  describe('consentLabel', () => {
    it('should join the toggle text parts and collapse whitespace', () => {
      i18nService.translate.mockImplementation((key: string) =>
        key === 'agb.modal.toggleText' ? 'I accept the [terms]  now' : key,
      );

      // Recreate the fixture so the cached `agbParts` computed reads the overridden translation.
      const freshFixture = TestBed.createComponent(AgbModalComponent);
      freshFixture.detectChanges();

      expect(freshFixture.componentInstance['consentLabel']()).toBe('I accept the terms now');
    });
  });

  describe('consent gating and event wiring', () => {
    it('should keep the accept button disabled until consent is checked', () => {
      agbModalService.__testSignals.open.set(true);
      fixture.detectChanges();

      const acceptButton = getAcceptButton();
      expect(acceptButton.disabled()).toBe(true);

      component['consentChecked'].set(true);
      fixture.detectChanges();

      expect(acceptButton.disabled()).toBe(false);
    });

    it('should accept when the accept button is clicked', () => {
      agbModalService.__testSignals.open.set(true);
      component['consentChecked'].set(true);
      fixture.detectChanges();

      const acceptButtonEl = fixture.debugElement
        .queryAll(By.directive(ButtonComponent))
        .find((el) => el.componentInstance.dataTestId() === 'agb-modal-accept');
      acceptButtonEl?.triggerEventHandler('handleClick', new Event('click'));

      expect(agbModalService.accept).toHaveBeenCalledTimes(1);
    });

    it('should dismiss when the modal is closed', () => {
      agbModalService.__testSignals.open.set(true);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.directive(ModalComponent));
      modal.triggerEventHandler('closed', true);

      expect(agbModalService.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  function getAcceptButton(): ButtonComponent {
    const acceptButtonEl = fixture.debugElement
      .queryAll(By.directive(ButtonComponent))
      .find((el) => el.componentInstance.dataTestId() === 'agb-modal-accept');
    if (!acceptButtonEl) {
      throw new Error('Accept button not found in the rendered modal.');
    }
    return acceptButtonEl.componentInstance;
  }
});
