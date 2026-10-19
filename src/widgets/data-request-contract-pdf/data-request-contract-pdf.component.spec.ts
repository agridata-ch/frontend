import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRevisionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataRequestDto } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockAgridataStateService,
  createMockContractRevisionService,
  MockContractRevisionService,
  createMockErrorHandlerService,
  MockErrorHandlerService,
  createMockI18nService,
  MockI18nService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestContractPdfComponent } from './data-request-contract-pdf.component';

const CONTRACT_REVISION_ID = '123456-7895648-654987';
const mockDataRequest: DataRequestDto = {
  burPresent: false,
  id: 'dr-1',
  stateCode: 'DRAFT',
  currentContractRevisionId: CONTRACT_REVISION_ID,
  advantages: [],
};

describe('DataRequestContractPdfComponent', () => {
  let component: DataRequestContractPdfComponent;
  let fixture: ComponentFixture<DataRequestContractPdfComponent>;
  let contractRevisionService: MockContractRevisionService;
  let errorHandlerService: MockErrorHandlerService;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    contractRevisionService = createMockContractRevisionService();
    errorHandlerService = createMockErrorHandlerService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataRequestContractPdfComponent, createTranslocoTestingModule()],
      providers: [
        provideHttpClient(),
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: ContractRevisionService, useValue: contractRevisionService },
        { provide: ErrorHandlerService, useValue: errorHandlerService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestContractPdfComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dataRequest', mockDataRequest);
    fixture.componentRef.setInput('contractRevisionId', CONTRACT_REVISION_ID);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute fileName from contractRevisionId', () => {
    expect(component['fileName']()).toBe('data-request.contractPdf.fileName.pdf');
  });

  describe('handleOpenPdf', () => {
    it('should fetch the PDF and open it in a new tab', async () => {
      const mockUrl = 'blob:http://localhost/mock-pdf';
      URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
      URL.revokeObjectURL = vi.fn();
      const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);

      component['handleOpenPdf']();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(contractRevisionService.getContractRevisionPdf).toHaveBeenCalledWith(
        CONTRACT_REVISION_ID,
        undefined,
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
      // Revoke is deferred (see openBlobInNewTab); it is covered by download.util.spec.
      expect(openSpy).toHaveBeenCalledWith(mockUrl, '_blank', 'noopener');

      openSpy.mockRestore();
    });

    it('should call errorHandler on fetch failure', async () => {
      const testError = new Error('PDF fetch failed');
      contractRevisionService.getContractRevisionPdf.mockRejectedValueOnce(testError);

      component['handleOpenPdf']();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(errorHandlerService.handleError).toHaveBeenCalledWith(testError);
    });

    it('should fetch only once while already loading', () => {
      component['handleOpenPdf']();
      component['handleOpenPdf']();
      expect(contractRevisionService.getContractRevisionPdf).toHaveBeenCalledTimes(1);
    });

    it('should reset the opening state after fetch completes', async () => {
      const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
      URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
      component['handleOpenPdf']();
      expect(component['downloads'].isOpening(CONTRACT_REVISION_ID)).toBe(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(component['downloads'].isOpening(CONTRACT_REVISION_ID)).toBe(false);
      openSpy.mockRestore();
    });

    it('should reset the opening state after fetch failure', async () => {
      contractRevisionService.getContractRevisionPdf.mockRejectedValueOnce(new Error('failed'));
      component['handleOpenPdf']();
      expect(component['downloads'].isOpening(CONTRACT_REVISION_ID)).toBe(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(component['downloads'].isOpening(CONTRACT_REVISION_ID)).toBe(false);
    });
  });

  describe('handleDownloadPdf', () => {
    it('should fetch the PDF and trigger a download', async () => {
      const mockUrl = 'blob:http://localhost/mock-pdf';
      URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
      URL.revokeObjectURL = vi.fn();

      const mockAnchor = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockAnchor as unknown as HTMLElement);
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node) => node);

      component['handleDownloadPdf']();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(contractRevisionService.getContractRevisionPdf).toHaveBeenCalledWith(
        CONTRACT_REVISION_ID,
        undefined,
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.href).toBe(mockUrl);
      expect(mockAnchor.download).toBe('data-request.contractPdf.fileName.pdf');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.remove).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
    });

    it('should call errorHandler on fetch failure', async () => {
      const testError = new Error('PDF download failed');
      contractRevisionService.getContractRevisionPdf.mockRejectedValueOnce(testError);

      component['handleDownloadPdf']();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(errorHandlerService.handleError).toHaveBeenCalledWith(testError);
    });

    it('should fetch only once while already loading', () => {
      component['handleDownloadPdf']();
      component['handleDownloadPdf']();
      expect(contractRevisionService.getContractRevisionPdf).toHaveBeenCalledTimes(1);
    });

    it('should reset the downloading state after fetch completes', async () => {
      const mockAnchor = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockAnchor as unknown as HTMLElement);
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node) => node);
      URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
      URL.revokeObjectURL = vi.fn();

      component['handleDownloadPdf']();
      expect(component['downloads'].isDownloading(CONTRACT_REVISION_ID)).toBe(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(component['downloads'].isDownloading(CONTRACT_REVISION_ID)).toBe(false);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
    });

    it('should reset the downloading state after fetch failure', async () => {
      contractRevisionService.getContractRevisionPdf.mockRejectedValueOnce(new Error('failed'));
      component['handleDownloadPdf']();
      expect(component['downloads'].isDownloading(CONTRACT_REVISION_ID)).toBe(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(component['downloads'].isDownloading(CONTRACT_REVISION_ID)).toBe(false);
    });
  });
});
