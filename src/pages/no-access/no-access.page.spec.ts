import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '@/environments/environment';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAuthService,
  createMockI18nService,
  MockAuthService,
} from '@/shared/testing/mocks';

import { NoAccessPage } from './no-access.page';

describe('NoAccessPage', () => {
  let authService: MockAuthService;
  let component: NoAccessPage;
  let fixture: ComponentFixture<NoAccessPage>;

  beforeEach(async () => {
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [NoAccessPage],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NoAccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log the user out when clicking the return button', () => {
    fixture.nativeElement.querySelector('button').click();

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('should open the contact form page in a new tab from the support button', () => {
    const supportLink = fixture.nativeElement.querySelector('a');

    expect(supportLink.getAttribute('href')).toBe(
      `${environment.appBaseUrl}/cms/contact#contact-form`,
    );
    expect(supportLink.getAttribute('target')).toBe('_blank');
  });
});
