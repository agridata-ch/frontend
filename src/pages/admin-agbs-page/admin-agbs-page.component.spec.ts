import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { MockInstance } from 'vitest';

import { AgbService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AgbRevisionSummaryDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import {
  createMockAgbService,
  createMockAgridataStateService,
  createMockErrorHandlerService,
  MockAgbService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { CellRendererTypes } from '@/shared/ui/agridata-table';
import { AGB_NEW_ID } from '@/widgets/admin-agb-form';

import { AdminAgbsPageComponent } from './admin-agbs-page.component';

describe('AdminAgbsPageComponent', () => {
  let fixture: ComponentFixture<AdminAgbsPageComponent>;
  let component: AdminAgbsPageComponent;
  let agbService: MockAgbService;
  let navigateSpy: MockInstance<Router['navigate']>;

  const revision: AgbRevisionSummaryDto = { id: 'agb-1', version: '1.0.0' };

  beforeEach(async () => {
    agbService = createMockAgbService();
    agbService.fetchAllAgbRevisions.mockResolvedValue({
      items: [revision],
      totalItems: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    });

    await TestBed.configureTestingModule({
      imports: [AdminAgbsPageComponent, createTranslocoTestingModule()],
      providers: [
        provideRouter([]),
        { provide: AgbService, useValue: agbService },
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: ErrorHandlerService, useValue: createMockErrorHandlerService() },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(AdminAgbsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }, 30000);

  it('should load the AGB revisions on init', () => {
    expect(agbService.fetchAllAgbRevisions).toHaveBeenCalledWith({});
    expect(component.fetchAgbRevisionsResource.value()?.items).toEqual([revision]);
  });

  it('should reload with the new query when the query parameters change', async () => {
    component.resourceQueryDto.set({ page: 1, size: 25, sortParams: ['-validFrom'] });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(agbService.fetchAllAgbRevisions).toHaveBeenLastCalledWith({
      page: 1,
      size: 25,
      sortParams: ['-validFrom'],
    });
  });

  it('should render the version of a row', () => {
    const versionColumn = component['agbRevisionsTableMetaData']().columns[0];

    expect(versionColumn.renderer.type).toBe(CellRendererTypes.FUNCTION);
    if (versionColumn.renderer.type === CellRendererTypes.FUNCTION) {
      expect(versionColumn.renderer.cellRenderFn(revision)).toBe('1.0.0');
    }
  });

  describe('navigation', () => {
    it('should navigate to the details when the row action is used', () => {
      const metadata = component['agbRevisionsTableMetaData']();

      expect(metadata.showRowActionButton).toBe(true);
      metadata.rowAction?.(revision);

      expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.ADMIN_AGBS_PATH, revision.id]);
    });

    it('should navigate to the create form when the create button is used', () => {
      component['openCreate']();

      expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.ADMIN_AGBS_PATH, AGB_NEW_ID]);
    });
  });

  it('should show a dash for missing dates', () => {
    const emptyRevision: AgbRevisionSummaryDto = { ...revision, validTo: undefined };
    const validTo = component['agbRevisionsTableMetaData']().columns[3].renderer;

    if (validTo.type === CellRendererTypes.FUNCTION) {
      expect(validTo.cellRenderFn(emptyRevision)).toBe('-');
    }
  });

  it('should pass the date fields of a row to the table for formatting', () => {
    const datedRevision: AgbRevisionSummaryDto = {
      ...revision,
      validFrom: '2026-01-01T00:00:00Z',
      validTo: '2026-12-31T00:00:00Z',
      enforceConsentFrom: '2026-02-01T00:00:00Z',
    };
    const [validFrom, validTo, enforceConsentFrom] = component['agbRevisionsTableMetaData']()
      .columns.slice(2)
      .map((column) => column.renderer);

    expect(validFrom.type).toBe(CellRendererTypes.FUNCTION);
    if (
      validFrom.type === CellRendererTypes.FUNCTION &&
      validTo.type === CellRendererTypes.FUNCTION &&
      enforceConsentFrom.type === CellRendererTypes.FUNCTION
    ) {
      expect(validFrom.cellRenderFn(datedRevision)).toBe(datedRevision.validFrom);
      expect(validTo.cellRenderFn(datedRevision)).toBe(datedRevision.validTo);
      expect(enforceConsentFrom.cellRenderFn(datedRevision)).toBe(datedRevision.enforceConsentFrom);
    }
  });
});
