import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserService } from '@/entities/api/user.service';
import { AgbAcceptanceStatusEnum } from '@/entities/openapi';
import { AgbAcceptancesPageComponent } from '@/pages/agb-acceptances-page/agb-acceptances-page.component';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nPipe } from '@/shared/i18n';
import {
  createMockErrorHandlerService,
  createMockUserService,
  MockErrorHandlerService,
  MockUserService,
} from '@/shared/testing/mocks';

describe('AgbAcceptancesPageComponent', () => {
  let component: AgbAcceptancesPageComponent;
  let fixture: ComponentFixture<AgbAcceptancesPageComponent>;

  let userService: MockUserService;
  let errorService: MockErrorHandlerService;

  beforeEach(async () => {
    userService = createMockUserService();
    errorService = createMockErrorHandlerService();

    await TestBed.configureTestingModule({
      imports: [AgbAcceptancesPageComponent, I18nPipe],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgbAcceptancesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load agb acceptances with the table query params', async () => {
    await fixture.whenStable();

    expect(userService.getAgbAcceptances).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, searchTerm: '' }),
    );
  });

  it('should send resource errors to the error service', async () => {
    const testError = new Error('Test error from getAgbAcceptances');
    userService.getAgbAcceptances.mockRejectedValueOnce(testError);

    const errorFixture = TestBed.createComponent(AgbAcceptancesPageComponent);
    errorFixture.detectChanges();
    await errorFixture.whenStable();

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });

  describe('status filter', () => {
    it('should have no column filters when no status is selected', () => {
      expect(component['columnFilters']()).toBeUndefined();
    });

    it('should map the selected status to a column filter and reload', async () => {
      component['statusFilter'].set(AgbAcceptanceStatusEnum.Pending);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['columnFilters']()).toEqual([`status:${AgbAcceptanceStatusEnum.Pending}`]);
      expect(userService.getAgbAcceptances).toHaveBeenLastCalledWith(
        expect.objectContaining({
          columnFilters: [`status:${AgbAcceptanceStatusEnum.Pending}`],
          page: 0,
        }),
      );
    });
  });

  it('should send the UID search term without separators', async () => {
    component['resourceQueryDto'].set({ page: 0, size: 10, searchTerm: 'che-123.456.789' });
    await fixture.whenStable();

    expect(userService.getAgbAcceptances).toHaveBeenLastCalledWith(
      expect.objectContaining({ searchTerm: 'CHE123456789' }),
    );
  });
});
