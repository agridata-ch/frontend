import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { ContractSignatureInputComponent } from './contract-signature-input.component';

describe('ContractSignatureInputComponent', () => {
  let component: ContractSignatureInputComponent;
  let fixture: ComponentFixture<ContractSignatureInputComponent>;
  let authService: MockAuthService;

  let i18nService: MockI18nService;

  beforeEach(async () => {
    authService = createMockAuthService();

    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [ContractSignatureInputComponent, createTranslocoTestingModule()],
      providers: [
        { provide: I18nService, useValue: i18nService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractSignatureInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse agbParts when translation contains brackets', () => {
    i18nService.translate.mockImplementation(() => 'Before [Link Text] After');

    const newFixture = TestBed.createComponent(ContractSignatureInputComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    const parts = newComponent['agbParts']();
    expect(parts.before).toBe('Before ');
    expect(parts.linkText).toBe('Link Text');
    expect(parts.after).toBe(' After');
  });

  it('should return full text in before when translation has no brackets', () => {
    i18nService.translate.mockImplementation(() => 'No brackets here');

    const newFixture = TestBed.createComponent(ContractSignatureInputComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    const parts = newComponent['agbParts']();
    expect(parts.before).toBe('No brackets here');
    expect(parts.linkText).toBeNull();
    expect(parts.after).toBe('');
  });
});
