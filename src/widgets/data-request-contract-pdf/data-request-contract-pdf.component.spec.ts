import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService } from '@/entities/api';
import { DataRequestDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  createMockContractRevisionService,
  MockContractRevisionService,
} from '@/shared/testing/mocks/mock-contract-revision-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks/mock-i18n-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestContractPdfComponent } from './data-request-contract-pdf.component';

const CONTRACT_REVISION_ID = '123456-7895648-654987';
const mockDataRequest: DataRequestDto = {
  id: 'dr-1',
  stateCode: 'draft',
  currentContractRevisionId: CONTRACT_REVISION_ID,
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
      URL.createObjectURL = jest.fn().mockReturnValue(mockUrl);
      URL.revokeObjectURL = jest.fn();
      const openSpy = jest.spyOn(globalThis, 'open').mockImplementation(() => null);

      component['handleOpenPdf']();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(contractRevisionService.getContractRevisionPdf).toHaveBeenCalledWith(
        CONTRACT_REVISION_ID,
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(mockUrl, '_blank');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);

      openSpy.mockRestore();
    });

    it('should call errorHandler on fetch failure', async () => {
      const testError = new Error('PDF fetch failed');
      contractRevisionService.getContractRevisionPdf.mockRejectedValueOnce(testError);

      component['handleOpenPdf']();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(errorHandlerService.handleError).toHaveBeenCalledWith(testError);
    });

    it('should not call service when already loading', () => {
      component['isLoadingOpen'].set(true);
      component['handleOpenPdf']();
      expect(contractRevisionService.getContractRevisionPdf).not.toHaveBeenCalled();
    });

    it('should reset isLoadingOpen after fetch completes', async () => {
      component['handleOpenPdf']();
      expect(component['isLoadingOpen']()).toBe(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(component['isLoadingOpen']()).toBe(false);
    });

    it('should reset isLoadingOpen after fetch failure', async () => {
      contractRevisionService.getContractRevisionPdf.mockRejectedValueOnce(new Error('failed'));
      component['handleOpenPdf']();
      expect(component['isLoadingOpen']()).toBe(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(component['isLoadingOpen']()).toBe(false);
    });
  });

  describe('handleDownloadPdf', () => {
    it('should fetch the PDF and trigger a download', async () => {
      const mockUrl = 'blob:http://localhost/mock-pdf';
      URL.createObjectURL = jest.fn().mockReturnValue(mockUrl);
      URL.revokeObjectURL = jest.fn();

      const mockAnchor = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockAnchor as unknown as HTMLElement);
      const appendChildSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node) => node);

      component['handleDownloadPdf']();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(contractRevisionService.getContractRevisionPdf).toHaveBeenCalledWith(
        CONTRACT_REVISION_ID,
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

    it('should not call service when already loading', () => {
      component['isLoadingDownload'].set(true);
      component['handleDownloadPdf']();
      expect(contractRevisionService.getContractRevisionPdf).not.toHaveBeenCalled();
    });

    it('should reset isLoadingDownload after fetch completes', async () => {
      const mockAnchor = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockAnchor as unknown as HTMLElement);
      const appendChildSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node) => node);
      URL.createObjectURL = jest.fn().mockReturnValue('blob:mock');
      URL.revokeObjectURL = jest.fn();

      component['handleDownloadPdf']();
      expect(component['isLoadingDownload']()).toBe(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(component['isLoadingDownload']()).toBe(false);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
    });

    it('should reset isLoadingDownload after fetch failure', async () => {
      contractRevisionService.getContractRevisionPdf.mockRejectedValueOnce(new Error('failed'));
      component['handleDownloadPdf']();
      expect(component['isLoadingDownload']()).toBe(true);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      expect(component['isLoadingDownload']()).toBe(false);
    });
  });
});
