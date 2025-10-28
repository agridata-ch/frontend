import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BackendVersionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { TestDataService } from '@/entities/openapi';
import { mockAgridataStateService } from '@/shared/testing/mocks/mock-agridata-state.service';
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
  let stateService: ReturnType<typeof mockAgridataStateService>;
  beforeEach(async () => {
    backendVersionService = createMockBackendVersionService();
    stateService = mockAgridataStateService('test-uid');
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
    await fixture.whenStable();
    const spanEl = fixture.debugElement.queryAll(By.css('.text-agridata-tertiary-text'));
    expect(spanEl[0].nativeElement.textContent).toContain(`FE ${frontendVersion}`);
    expect(spanEl[0].nativeElement.textContent).toContain(`BE ${beVersion}`);
  });
});
