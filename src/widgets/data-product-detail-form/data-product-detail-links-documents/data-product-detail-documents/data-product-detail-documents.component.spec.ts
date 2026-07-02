import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataProductUpdateDto as DataProductUpdateDtoSchema } from '@/assets/formSchemas/agridata-schemas.json';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductDocumentService } from '@/entities/api/data-product-document.service';
import { DocumentScanStatus } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { buildReactiveForm } from '@/shared/lib/form.helper';
import {
  createMockAgridataStateService,
  createMockDataProductDocumentService,
  createMockI18nService,
  MockDataProductDocumentService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { dataProductFormsModel, FORM_TAB_IDS } from '@/widgets/data-product-detail-form';

import { DataProductDetailDocumentsComponent } from './data-product-detail-documents.component';
import { DocumentUploadStatus } from '../document-upload.model';
import { DocumentUploadStore } from '../document-upload.store';

function pdf(name: string): File {
  return new File(['content'], name, { type: 'application/pdf' });
}

describe('DataProductDetailDocumentsComponent', () => {
  let fixture: ComponentFixture<DataProductDetailDocumentsComponent>;
  let component: DataProductDetailDocumentsComponent;
  let componentRef: ComponentRef<DataProductDetailDocumentsComponent>;
  let store: DocumentUploadStore;
  let documentService: MockDataProductDocumentService;

  beforeEach(async () => {
    documentService = createMockDataProductDocumentService();

    await TestBed.configureTestingModule({
      imports: [DataProductDetailDocumentsComponent, createTranslocoTestingModule()],
      providers: [
        DocumentUploadStore,
        { provide: DataProductDocumentService, useValue: documentService },
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductDetailDocumentsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    store = TestBed.inject(DocumentUploadStore);

    const i18n = TestBed.inject(I18nService);
    const form = buildReactiveForm(DataProductUpdateDtoSchema, dataProductFormsModel, i18n);
    componentRef.setInput('form', form.get(FORM_TAB_IDS.LINKS_DOCUMENTS));

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stages files selected via the dropzone into the staged section', () => {
    const dropzone = fixture.nativeElement.querySelector('app-agridata-dropzone input[type=file]');
    expect(dropzone).toBeTruthy();

    store.addFiles([pdf('a.pdf')]);
    fixture.detectChanges();

    expect(store.stagedItems()).toHaveLength(1);
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems).toHaveLength(1);
  });

  it('renders previously uploaded documents in a separate section', async () => {
    documentService.listDocuments.mockResolvedValueOnce([
      { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
    ]);
    await store.loadExisting('product-1');
    store.addFiles([pdf('new.pdf')]);
    fixture.detectChanges();

    expect(store.uploadedItems().map((item) => item.filename)).toEqual(['existing.pdf']);
    expect(store.stagedItems().map((item) => item.filename)).toEqual(['new.pdf']);
    expect(fixture.nativeElement.querySelectorAll('ul')).toHaveLength(2);
  });

  it('removes a staged file through the store', async () => {
    store.addFiles([pdf('a.pdf')]);
    fixture.detectChanges();

    component['handleRemove'](store.items()[0]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(store.items()).toHaveLength(0);
  });

  it('marks an existing document for removal instead of deleting it immediately', async () => {
    documentService.listDocuments.mockResolvedValueOnce([
      { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
    ]);
    await store.loadExisting('product-1');
    fixture.detectChanges();

    component['handleRemove'](store.items()[0]);
    fixture.detectChanges();

    expect(documentService.deleteDocument).not.toHaveBeenCalled();
    expect(store.items()[0].markedForRemoval).toBe(true);
  });

  it('restores a document that was marked for removal', async () => {
    documentService.listDocuments.mockResolvedValueOnce([
      { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
    ]);
    await store.loadExisting('product-1');
    component['handleRemove'](store.items()[0]);
    fixture.detectChanges();

    component['handleRestore'](store.items()[0]);
    fixture.detectChanges();

    expect(store.items()[0].markedForRemoval).toBe(false);
  });

  it('maps document states to badge variants', () => {
    expect(component['badgeVariant'](DocumentUploadStatus.Available)).toBe('success');
    expect(component['badgeVariant'](DocumentUploadStatus.PendingScan)).toBe('warning');
    expect(component['badgeVariant'](DocumentUploadStatus.Rejected)).toBe('error');
    expect(component['badgeVariant'](DocumentUploadStatus.Error)).toBe('error');
  });

  it('marks only available existing documents as downloadable', () => {
    const available = { isExisting: true, status: DocumentUploadStatus.Available };
    const pending = { isExisting: true, status: DocumentUploadStatus.PendingScan };
    const staged = { isExisting: false, status: DocumentUploadStatus.Available };

    expect(component['isDownloadable'](available as never)).toBe(true);
    expect(component['isDownloadable'](pending as never)).toBe(false);
    expect(component['isDownloadable'](staged as never)).toBe(false);
  });

  it('downloads an existing document through the store', async () => {
    URL.createObjectURL = jest.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = jest.fn();
    documentService.listDocuments.mockResolvedValueOnce([
      { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
    ]);
    await store.loadExisting('product-1');

    component['handleDownload'](store.items()[0]);
    await fixture.whenStable();

    expect(documentService.downloadDocument).toHaveBeenCalledWith('product-1', 'doc-1', undefined);
  });

  it('opens an existing document in a new tab through the store', async () => {
    URL.createObjectURL = jest.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = jest.fn();
    const openSpy = jest.spyOn(globalThis, 'open').mockImplementation(() => null);
    documentService.listDocuments.mockResolvedValueOnce([
      { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
    ]);
    await store.loadExisting('product-1');

    component['handleOpen'](store.items()[0]);
    await fixture.whenStable();

    expect(documentService.downloadDocument).toHaveBeenCalledWith('product-1', 'doc-1', undefined);
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });
});
