import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestAggregationSummaryDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  createMockAgridataStateService,
  createMockI18nService,
  mockConsentRequestAggregations,
  MockAgridataStateService,
  MockI18nService,
} from '@/shared/testing/mocks';
import { ConsentRequestMigrationAlertsComponent } from '@/widgets/consent-request-migration-alerts';

describe('ConsentRequestMigrationAlertsComponent', () => {
  let fixture: ComponentFixture<ConsentRequestMigrationAlertsComponent>;
  let component: ConsentRequestMigrationAlertsComponent;
  let agridataStateService: MockAgridataStateService;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    agridataStateService = createMockAgridataStateService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [ConsentRequestMigrationAlertsComponent],
      providers: [
        { provide: AgridataStateService, useValue: agridataStateService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestMigrationAlertsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('requests', mockConsentRequestAggregations);
    fixture.detectChanges();
  });

  const getAlert = (id: string) =>
    component['migrationInfos']().find((migrationInfo) => migrationInfo.id === id);

  it('should group maf-migrated requests by consumer', () => {
    const groups = getAlert('maf')?.groups ?? [];

    expect(groups).toHaveLength(1);
    expect(groups[0].consumerName).toBe('Test AG');
    expect(groups[0].requests).toEqual([mockConsentRequestAggregations[0]]);
  });

  it('should group tvd-migrated requests by consumer', () => {
    const groups = getAlert('tvd')?.groups ?? [];

    expect(groups).toHaveLength(1);
    expect(groups[0].consumerName).toBe('Open AG');
    expect(groups[0].requests).toEqual([mockConsentRequestAggregations[2]]);
  });

  it('should keep multiple requests from the same consumer in a single group', () => {
    const secondMafRequestSameConsumer: ConsentRequestAggregationSummaryDto = {
      ...mockConsentRequestAggregations[0],
      id: 'dr-1-b',
    };
    fixture.componentRef.setInput('requests', [
      mockConsentRequestAggregations[0],
      secondMafRequestSameConsumer,
    ]);
    fixture.detectChanges();

    const groups = getAlert('maf')?.groups ?? [];
    expect(groups).toHaveLength(1);
    expect(groups[0].requests).toHaveLength(2);
  });

  it('should add confirmed migration ids for every visible maf request when closing the maf alert', () => {
    const addConfirmedMigratedUidsSpy = vi.spyOn(agridataStateService, 'addConfirmedMigratedUids');
    const mafAlert = getAlert('maf');
    if (!mafAlert) throw new Error('maf alert missing');

    component['handleClose'](mafAlert);

    expect(addConfirmedMigratedUidsSpy).toHaveBeenCalledWith(['dr-1']);
  });

  it('should add confirmed migration ids for every visible tvd request when closing the tvd alert', () => {
    const addConfirmedMigratedUidsSpy = vi.spyOn(agridataStateService, 'addConfirmedMigratedUids');
    const tvdAlert = getAlert('tvd');
    if (!tvdAlert) throw new Error('tvd alert missing');

    component['handleClose'](tvdAlert);

    expect(addConfirmedMigratedUidsSpy).toHaveBeenCalledWith(['dr-3']);
  });

  it('should return no migration infos when no requests are migrated from any source', () => {
    const nonMigratedRequests = mockConsentRequestAggregations.filter(
      (req) => !req.showStateAsMigratedFromMaf && !req.showStateAsMigratedFromTvd,
    );
    fixture.componentRef.setInput('requests', nonMigratedRequests);
    fixture.detectChanges();

    expect(component['migrationInfos']()).toHaveLength(0);
  });

  it('should return migrated request title with data request name if available', () => {
    const migratedRequest = {
      ...mockConsentRequestAggregations[0],
      dataRequest: {
        ...mockConsentRequestAggregations[0].dataRequest,
      },
    } as ConsentRequestAggregationSummaryDto;

    const title = component['getMigratedRequestTitle'](migratedRequest);

    expect(title).toBe(mockConsentRequestAggregations[0].dataRequest?.title?.de);
  });
});
