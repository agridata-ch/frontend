import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserService } from '@/entities/api/user.service';
import { FarmOverviewDto, FarmTypeEnum } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockAgridataStateService,
  createMockErrorHandlerService,
  createMockI18nService,
  createMockUserService,
  MockAgridataStateService,
  MockUserService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { TooltipBubbleService } from '@/shared/tooltip';

import { MyFarmPage } from './my-farm-page.component';

const company = {
  uid: 'CHE123456789',
  name: 'Lukas Landwirt',
  address: { street: 'Betelriedgasse', houseNumber: '2', zipCode: '3771', town: 'Blankenburg' },
};

describe('MyFarmPage', () => {
  let fixture: ComponentFixture<MyFarmPage>;
  let component: MyFarmPage;
  let stateService: MockAgridataStateService;
  let userService: MockUserService;
  let writeText: Mock;

  async function render(overview: FarmOverviewDto) {
    userService.getFarmOverview.mockResolvedValue(overview);
    fixture = TestBed.createComponent(MyFarmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    stateService = createMockAgridataStateService();
    stateService.__testSignals.activeUid.set(company.uid);
    stateService.__testSignals.actingRole.set('PRODUCER');
    userService = createMockUserService();

    await TestBed.configureTestingModule({
      imports: [MyFarmPage, createTranslocoTestingModule()],
      providers: [
        { provide: AgridataStateService, useValue: stateService },
        { provide: UserService, useValue: userService },
        { provide: ErrorHandlerService, useValue: createMockErrorHandlerService() },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: TooltipBubbleService, useValue: { show: vi.fn(), showTransient: vi.fn() } },
      ],
    }).compileComponents();
  });

  describe('loading', () => {
    it('fetches the overview for the active uid and acting role', async () => {
      await render({ company, farms: [] });

      expect(userService.getFarmOverview).toHaveBeenCalledWith(company.uid, 'PRODUCER');
    });

    it('does not fetch while the uid is missing', async () => {
      stateService.__testSignals.uidMissing.set(true);
      await render({ company, farms: [] });

      expect(userService.getFarmOverview).not.toHaveBeenCalled();
      expect(component['sections']()).toEqual([]);
    });
  });

  describe('single farm', () => {
    it('shows company and farm fields in one section', async () => {
      await render({ company, farms: [{ bur: '99V631', ktIdB: 'BE-85697' }] });

      expect(component['sections']()).toEqual([
        {
          title: 'Lukas Landwirt',
          address: 'Betelriedgasse 2, 3771 Blankenburg',
          fields: [
            { key: 'uid', value: 'CHE123456789' },
            { key: 'bur', value: '99V631' },
            { key: 'ktIdB', value: 'BE-85697' },
          ],
        },
      ]);
    });

    it('shows only the uid when there is no farm', async () => {
      await render({ company: { uid: company.uid }, farms: [] });

      expect(component['sections']()).toEqual([
        { title: '', address: '', fields: [{ key: 'uid', value: 'CHE123456789' }] },
      ]);
    });

    it('copies all values as flat lines', async () => {
      await render({ company, farms: [{ bur: '99V631', ktIdB: 'BE-85697' }] });

      component['copyAll'](new MouseEvent('click'));

      expect(writeText).toHaveBeenCalledWith('UID: CHE123456789\nBUR: 99V631\nKT_ID_B: BE-85697');
    });
  });

  describe('multiple farms', () => {
    const farms = [
      {
        bur: '99V631',
        ktIdB: 'BE-85697',
        farmTypeCode: FarmTypeEnum.Soemmerungsbetrieb,
        address: { addressLine: 'Beim Bahnhöfli', zipCode: '3771', town: 'Blankenburg' },
      },
      { bur: 'B887463', farmTypeCode: FarmTypeEnum.Produktionsstaette },
      { bur: 'C1' },
    ];

    it('shows one section per farm after the company', async () => {
      await render({ company, farms });

      const sections = component['sections']();
      expect(sections).toHaveLength(4);
      expect(sections[0].fields).toEqual([{ key: 'uid', value: 'CHE123456789' }]);
      expect(sections[1]).toEqual({
        title: '',
        farmType: FarmTypeEnum.Soemmerungsbetrieb,
        address: 'Beim Bahnhöfli, 3771 Blankenburg',
        fields: [
          { key: 'bur', value: '99V631' },
          { key: 'ktIdB', value: 'BE-85697' },
        ],
      });
      expect(sections[2].fields).toEqual([{ key: 'bur', value: 'B887463' }]);
      expect(sections[3].farmType).toBe(FarmTypeEnum.Unknown);
    });

    it('copies all values grouped by farm type', async () => {
      await render({ company, farms });

      component['copyAll'](new MouseEvent('click'));

      expect(writeText).toHaveBeenCalledWith(
        [
          'UID: CHE123456789',
          `my-farm.farmType.${FarmTypeEnum.Soemmerungsbetrieb}:`,
          '  BUR: 99V631',
          '  KT_ID_B: BE-85697',
          `my-farm.farmType.${FarmTypeEnum.Produktionsstaette}:`,
          '  BUR: B887463',
          `my-farm.farmType.${FarmTypeEnum.Unknown}:`,
          '  BUR: C1',
        ].join('\n'),
      );
    });
  });
});
