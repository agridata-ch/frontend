import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  faDownload,
  faFilePdf,
  faRotateLeft,
  faTrashCan,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { AgridataBadgeComponent, BadgeVariant } from '@/shared/ui/badge';
import { ButtonComponent } from '@/shared/ui/button';

import { AgridataFileDownloadComponent } from './agridata-file-download.component';

describe('AgridataFileDownloadComponent', () => {
  let component: AgridataFileDownloadComponent;
  let componentRef: ComponentRef<AgridataFileDownloadComponent>;
  let fixture: ComponentFixture<AgridataFileDownloadComponent>;
  let i18nService: MockI18nService;

  function buttonWithIcon(icon: IconDefinition) {
    return fixture.debugElement
      .queryAll(By.directive(ButtonComponent))
      .find((button) => button.componentInstance.icon() === icon);
  }

  beforeEach(async () => {
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [AgridataFileDownloadComponent],
      providers: [{ provide: I18nService, useValue: i18nService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataFileDownloadComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('fileName', 'contract.pdf');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('derives the file icon from the file name', () => {
    expect(component['fileIcon']()).toBe(faFilePdf);
  });

  describe('open action', () => {
    it('renders a clickable file-name button that emits handleOpen when downloadable', () => {
      const emitSpy = jest.fn();
      component.handleOpen.subscribe(emitSpy);
      componentRef.setInput('downloadable', true);
      fixture.detectChanges();

      buttonWithIcon(faFilePdf)?.triggerEventHandler('handleClick', new MouseEvent('click'));

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('renders the file name as plain text (no button) when not downloadable', () => {
      componentRef.setInput('downloadable', false);
      componentRef.setInput('removable', false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(ButtonComponent))).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('contract.pdf');
    });
  });

  describe('download action', () => {
    it('renders a download button that emits handleDownload when downloadable', () => {
      const emitSpy = jest.fn();
      component.handleDownload.subscribe(emitSpy);
      componentRef.setInput('downloadable', true);
      fixture.detectChanges();

      buttonWithIcon(faDownload)?.triggerEventHandler('handleClick', new MouseEvent('click'));

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('shows a visible label when downloadLabel is set, otherwise an aria-label', () => {
      componentRef.setInput('downloadable', true);
      fixture.detectChanges();

      // icon-only: aria-label from i18n, no visible text
      expect(buttonWithIcon(faDownload)?.componentInstance.ariaLabel()).toBe(
        'fileDownload.download',
      );

      componentRef.setInput('downloadLabel', 'Download');
      fixture.detectChanges();

      // visible label: no overriding aria-label
      expect(buttonWithIcon(faDownload)?.componentInstance.ariaLabel()).toBe('');
      expect(fixture.nativeElement.textContent).toContain('Download');
    });
  });

  describe('remove action', () => {
    it('renders a remove button that emits handleRemove when removable', () => {
      const emitSpy = jest.fn();
      component.handleRemove.subscribe(emitSpy);
      componentRef.setInput('removable', true);
      fixture.detectChanges();

      buttonWithIcon(faTrashCan)?.triggerEventHandler('handleClick', new MouseEvent('click'));

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('restore action', () => {
    it('replaces the remove button with a restore button when marked for removal', () => {
      componentRef.setInput('removable', true);
      componentRef.setInput('markedForRemoval', true);
      fixture.detectChanges();

      expect(buttonWithIcon(faTrashCan)).toBeUndefined();
      expect(buttonWithIcon(faRotateLeft)).toBeTruthy();
    });

    it('emits handleRestore when the restore button is clicked', () => {
      const emitSpy = jest.fn();
      component.handleRestore.subscribe(emitSpy);
      componentRef.setInput('markedForRemoval', true);
      fixture.detectChanges();

      buttonWithIcon(faRotateLeft)?.triggerEventHandler('handleClick', new MouseEvent('click'));

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('badge', () => {
    it('renders a badge only when badgeText is set', () => {
      expect(fixture.debugElement.query(By.directive(AgridataBadgeComponent))).toBeNull();

      componentRef.setInput('badgeText', 'Available');
      componentRef.setInput('badgeVariant', BadgeVariant.SUCCESS);
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.directive(AgridataBadgeComponent));
      expect(badge).toBeTruthy();
      expect(badge.componentInstance.text()).toBe('Available');
      expect(badge.componentInstance.variant()).toBe(BadgeVariant.SUCCESS);
    });
  });

  describe('file size', () => {
    it('shows the formatted size when sizeBytes is greater than zero', () => {
      componentRef.setInput('sizeBytes', 2048);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('2kB');
    });

    it('hides the size when sizeBytes is zero', () => {
      componentRef.setInput('sizeBytes', 0);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('0B');
    });
  });
});
