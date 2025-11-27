import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { BackendInfoService } from '@/entities/api';
import { DummyComponent } from '@/shared/testing/mocks/dummy-components';

import { MaintenancePage } from './maintenance.page';

const beVersion = '1.0.0';

const createMockBackendVersionService = () =>
  ({
    fetchBackendInfo: jest.fn().mockResolvedValue({ version: beVersion }),
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
    const navSpy = jest.spyOn(router, 'navigate');

    fixture.detectChanges();

    await fixture.whenStable();

    expect(navSpy).toHaveBeenCalledWith(['/']);
  });
});
