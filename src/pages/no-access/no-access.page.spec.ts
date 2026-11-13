import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '@/environments/environment';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';

import { NoAccessPage } from './no-access.page';

describe('NoAccessPage', () => {
  let component: NoAccessPage;
  let fixture: ComponentFixture<NoAccessPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoAccessPage],
      providers: [{ provide: I18nService, useValue: createMockI18nService() }],
    }).compileComponents();

    fixture = TestBed.createComponent(NoAccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should link the return button to the homepage', () => {
    const returnLink = fixture.nativeElement.querySelector('a');

    expect(returnLink.getAttribute('href')).toBe(environment.appBaseUrl);
  });
});
