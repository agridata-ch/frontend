import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { AgbService } from '@/entities/api';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import {
  createMockAgbService,
  createMockErrorHandlerService,
  createMockToastService,
  MockAgbService,
  MockErrorHandlerService,
  MockToastService,
  mockAgbRevision,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService } from '@/shared/toast';

import { AdminAgbFormComponent } from './admin-agb-form.component';
import { AGB_NEW_ID } from './admin-agb-form.model';

describe('AdminAgbFormComponent', () => {
  let fixture: ComponentFixture<AdminAgbFormComponent>;
  let component: AdminAgbFormComponent;
  let componentRef: ComponentFixture<AdminAgbFormComponent>['componentRef'];
  let agbService: MockAgbService;
  let errorService: MockErrorHandlerService;
  let toastService: MockToastService;

  beforeEach(async () => {
    agbService = createMockAgbService();
    errorService = createMockErrorHandlerService();
    toastService = createMockToastService();
    await TestBed.configureTestingModule({
      imports: [AdminAgbFormComponent, createTranslocoTestingModule()],
      providers: [
        provideRouter([]),
        { provide: AgbService, useValue: agbService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAgbFormComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('agbId', AGB_NEW_ID);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should open the sidepanel after the first render', () => {
    expect(component['isOpen']()).toBe(true);
  });

  describe('mode', () => {
    it('should be in create mode for the new id', () => {
      expect(component['isViewMode']()).toBe(false);
      expect(component['sidepanelTitle']()).toBe('admin-agbs.form.title');
    });

    it('should be in view mode for an existing id', () => {
      componentRef.setInput('agbId', 'agb-1');
      fixture.detectChanges();

      expect(component['isViewMode']()).toBe(true);
      expect(component['sidepanelTitle']()).toBe('admin-agbs.table.titleValue');
    });

    it('should have no version without navigation state', () => {
      expect(component['getControl']('version').value).toBe('');
    });
  });

  describe('view mode', () => {
    it('should load the revision by id and fill the form', async () => {
      const viewFixture = TestBed.createComponent(AdminAgbFormComponent);
      viewFixture.componentRef.setInput('agbId', 'agb-1');
      viewFixture.detectChanges();
      await viewFixture.whenStable();
      const viewComponent = viewFixture.componentInstance;

      expect(agbService.fetchAgbRevision).toHaveBeenCalledWith('agb-1');
      expect(viewComponent['getControl']('version').value).toBe(mockAgbRevision.version);
      expect(viewComponent['getControl']('agbText.de').value).toBe(mockAgbRevision.agbText?.de);
      expect(viewComponent['hasEnforceConsentDate']()).toBe(false);
    });

    it('should fill the validity dates formatted and leave missing dates empty', async () => {
      const viewFixture = TestBed.createComponent(AdminAgbFormComponent);
      viewFixture.componentRef.setInput('agbId', 'agb-1');
      viewFixture.detectChanges();
      await viewFixture.whenStable();
      const viewComponent = viewFixture.componentInstance;

      expect(viewComponent['getControl']('validFrom').value).toBe('01.01.2026');
      expect(viewComponent['getControl']('validTo').value).toBe('');
      expect(viewComponent['getControl']('enforceConsentFrom').value).toBe('');
    });

    it('should render the AGB texts once loaded', async () => {
      const viewFixture = TestBed.createComponent(AdminAgbFormComponent);
      viewFixture.componentRef.setInput('agbId', 'agb-1');
      viewFixture.detectChanges();
      await viewFixture.whenStable();
      viewFixture.detectChanges();
      await viewFixture.whenStable();

      const text: string = viewFixture.nativeElement.textContent;
      expect(text).toContain(mockAgbRevision.agbText?.de);
      expect(text).toContain(mockAgbRevision.agbText?.fr);
      expect(text).toContain(mockAgbRevision.agbText?.it);
    });

    it('should not fetch in create mode', () => {
      expect(agbService.fetchAgbRevision).not.toHaveBeenCalled();
    });
  });

  describe('consent date', () => {
    it('should exclude the date from validation while the toggle is off', () => {
      expect(component['getControl']('enforceConsentFrom').disabled).toBe(true);
    });

    it('should require the date once the toggle is on', async () => {
      component['hasEnforceConsentDate'].set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const date = component['getControl']('enforceConsentFrom');
      expect(date.enabled).toBe(true);
      expect(date.hasError('required')).toBe(true);
    });
  });

  it('should reject a consent date in the past', async () => {
    component['hasEnforceConsentDate'].set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const date = component['getControl']('enforceConsentFrom');

    date.setValue('2000-01-01');
    expect(date.hasError('min')).toBe(true);

    date.setValue(component['today']);
    expect(date.valid).toBe(true);
  });

  describe('publish', () => {
    it('should mark the form as touched and not open the confirmation while fields are empty', () => {
      component['openPublishConfirm']();

      expect(component['form'].invalid).toBe(true);
      expect(component['getControl']('version').touched).toBe(true);
      expect(component['isPublishConfirmOpen']()).toBe(false);
    });

    it('should require every language of the AGB text', () => {
      component['getControl']('version').setValue('2.0.0');

      expect(component['form'].invalid).toBe(true);

      for (const lang of component['availableLangs']) {
        component['getControl'](`agbText.${lang}`).setValue('<p>text</p>');
      }

      expect(component['form'].valid).toBe(true);
    });

    describe('with a valid form', () => {
      let navigateSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        component['getControl']('version').setValue('2.0.0');
        for (const lang of component['availableLangs']) {
          component['getControl'](`agbText.${lang}`).setValue(`<p>${lang}</p>`);
        }
      });

      it('should open the confirmation without creating the revision', () => {
        component['openPublishConfirm']();

        expect(component['isPublishConfirmOpen']()).toBe(true);
        expect(agbService.createAgbRevision).not.toHaveBeenCalled();
      });

      it('should create the revision, show a toast and close', async () => {
        await component['confirmPublish']();

        expect(component['isPublishConfirmOpen']()).toBe(false);

        expect(agbService.createAgbRevision).toHaveBeenCalledWith({
          version: '2.0.0',
          agbText: { de: '<p>de</p>', fr: '<p>fr</p>', it: '<p>it</p>' },
        });
        expect(toastService.show).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalled();
      });

      it('should send the consent date as local date time when enforced', async () => {
        component['hasEnforceConsentDate'].set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        component['getControl']('enforceConsentFrom').setValue('2026-12-01');

        await component['confirmPublish']();

        expect(agbService.createAgbRevision).toHaveBeenCalledWith(
          expect.objectContaining({ enforceConsentFrom: '2026-12-01T00:00:00' }),
        );
      });

      it('should report the error and stay open when creating fails', async () => {
        const error = new Error('exists');
        agbService.createAgbRevision.mockRejectedValueOnce(error);

        await component['confirmPublish']();

        expect(errorService.handleError).toHaveBeenCalledWith(error);
        expect(component['isPublishing']()).toBe(false);
        expect(toastService.show).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();
      });
    });
  });

  it('should render an error outlet inside the sidepanel', () => {
    expect(fixture.debugElement.query(By.directive(ErrorOutletComponent))).not.toBeNull();
  });

  it('should navigate back to the list when closed', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component['closeSidepanel']();

    expect(navigateSpy).toHaveBeenCalledWith(['..'], expect.objectContaining({}));
  });
});
