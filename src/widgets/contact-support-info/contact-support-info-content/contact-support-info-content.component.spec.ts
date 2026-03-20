import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { createMockI18nService } from '@/shared/testing/mocks';
import { createMockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { ContactSupportInfoContentComponent } from './contact-support-info-content.component';

describe('ContactSupportInfoContentComponent', () => {
  let component: ContactSupportInfoContentComponent;
  let fixture: ComponentFixture<ContactSupportInfoContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactSupportInfoContentComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactSupportInfoContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
