import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BackendVersionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { TestDataService } from '@/entities/openapi';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import { FooterWidgetComponent } from '@/widgets/footer-widget';

import { version as frontendVersion } from '../../../../package.json';

const beVersion = '1.0.0';

const createMockBackendVersionService = () =>
  ({
    fetchBackendVersion: jest.fn().mockResolvedValue({ version: beVersion }),
  }) satisfies Partial<BackendVersionService>;

describe('FooterWidgetComponent', () => {
  let component: FooterWidgetComponent;
  let fixture: ComponentFixture<FooterWidgetComponent>;
  let backendVersionService: ReturnType<typeof createMockBackendVersionService>;
  let stateService: MockAgridataStateService;
  beforeEach(async () => {
    backendVersionService = createMockBackendVersionService();
    stateService = createMockAgridataStateService();
    await TestBed.configureTestingModule({
      imports: [FooterWidgetComponent],
      providers: [
        { provide: AgridataStateService, useValue: stateService },
        { provide: BackendVersionService, useValue: backendVersionService },
        { provide: TestDataService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders FE and BE version', async () => {
    stateService.__testSignals.currentRouteWithoutQueryParams.set('/test-route');

    await fixture.whenStable();
    const spanEl = fixture.debugElement.queryAll(By.css('.text-agridata-tertiary-text'));
    expect(spanEl[0].nativeElement.textContent).toContain(`FE ${frontendVersion}`);
    expect(spanEl[0].nativeElement.textContent).toContain(`BE ${beVersion}`);
  });

  describe('handleCopyright', () => {
    it('should hide copyright after exactly 7 clicks within timeout', async () => {
      // Call handleClickCopyright 7 times
      for (let i = 0; i < 7; i++) {
        component['handleClickCopyright']();
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(component['hideCopyright']()).toBe(true);
    });

    it('should not hide copyright when calling more than 7 times', async () => {
      // Call handleClickCopyright 8 times
      for (let i = 0; i < 8; i++) {
        component['handleClickCopyright']();
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(component['hideCopyright']()).toBe(false);
    });

    it('should not hide copyright when calls are interrupted by timeout', async () => {
      // First batch of calls
      for (let i = 0; i < 4; i++) {
        component['handleClickCopyright']();
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Second batch of calls
      for (let i = 0; i < 3; i++) {
        component['handleClickCopyright']();
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(component['hideCopyright']()).toBe(false);
    });
  });
});
