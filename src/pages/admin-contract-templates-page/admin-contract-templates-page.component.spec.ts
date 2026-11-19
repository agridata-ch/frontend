import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractTemplateService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ContractTemplateVersionDto } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import {
  createMockAgridataStateService,
  createMockContractTemplateService,
  createMockErrorHandlerService,
  MockContractTemplateService,
  mockContractTemplateVersion,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { CellRendererTypes } from '@/shared/ui/agridata-table';

import { AdminContractTemplatesPageComponent } from './admin-contract-templates-page.component';

describe('AdminContractTemplatesPageComponent', () => {
  let fixture: ComponentFixture<AdminContractTemplatesPageComponent>;
  let component: AdminContractTemplatesPageComponent;
  let contractTemplateService: MockContractTemplateService;

  const renderCell = (index: number, row: ContractTemplateVersionDto) => {
    const renderer = component['tableMetaData']().columns[index].renderer;
    if (renderer.type !== CellRendererTypes.FUNCTION) {
      throw new Error('Expected a function renderer');
    }
    return renderer.cellRenderFn(row);
  };

  beforeEach(async () => {
    contractTemplateService = createMockContractTemplateService();

    await TestBed.configureTestingModule({
      imports: [AdminContractTemplatesPageComponent, createTranslocoTestingModule()],
      providers: [
        { provide: ContractTemplateService, useValue: contractTemplateService },
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: ErrorHandlerService, useValue: createMockErrorHandlerService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminContractTemplatesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }, 30000);

  it('should load the contract template versions on init', () => {
    expect(contractTemplateService.fetchAllContractTemplateVersions).toHaveBeenCalledTimes(1);
    expect(component['fetchContractTemplateVersionsResource'].value()?.items).toEqual([
      mockContractTemplateVersion,
    ]);
  });

  it('should render version, validFrom and validTo of a row', () => {
    const row: ContractTemplateVersionDto = {
      version: '2.0.0',
      validFrom: '2026-01-01T00:00:00Z',
      validTo: '2026-12-31T00:00:00Z',
    };

    expect(renderCell(0, row)).toBe('2.0.0');
    expect(renderCell(1, row)).toBe('01.01.2026');
    expect(renderCell(2, row)).toBe('31.12.2026');
  });

  it('should show a dash for a missing validTo', () => {
    expect(renderCell(2, { ...mockContractTemplateVersion, validTo: undefined })).toBe('-');
  });
});
