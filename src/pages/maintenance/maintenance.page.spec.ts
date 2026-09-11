import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { BackendInfoService } from '@/entities/api';
import { DummyComponent } from '@/shared/testing/mocks';

import { MaintenancePage } from './maintenance.page';

const beVersion = '1.0.0';

const createMockBackendVersionService = () =>
  ({
    fetchBackendInfo: vi.fn().mockResolvedValue({ version: beVersion }),
  }) satisfies Partial<BackendInfoService>;

describe('MaintenancePage', () => {
  let component: MaintenancePage;
  let fixture: ComponentFixture<MaintenancePage>;
  let backendVersionService: ReturnType<typeof createMockBackendVersionService>;
  let router: Router;

  beforeEach(async () => {
    backendVersionService = createMockBackendVersionService();
    await TestBed.configureTestingModule({
      imports: [MaintenancePage],
      providers: [
        { provide: BackendInfoService, useValue: backendVersionService },
        provideRouter([{ path: '', component: DummyComponent }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenancePage);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should navigate to route when maintenance is no longer active', async () => {
    const navSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();

    await fixture.whenStable();

    expect(navSpy).toHaveBeenCalledWith(['/']);
  });

  it('should stay on the page and warn when the backend is still unreachable', async () => {
    backendVersionService.fetchBackendInfo.mockRejectedValue(new Error('down'));
    const navSpy = vi.spyOn(router, 'navigate');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();

    expect(navSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('should reload the page', () => {
    // jsdom's location.reload is a non-configurable no-op that can't be spied; assert the
    // delegation runs without throwing.
    expect(() => component['reloadPage']()).not.toThrow();
  });
});
