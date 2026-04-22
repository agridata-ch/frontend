import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { ExternalServiceErrorPage } from './external-service-error.page';

describe('ExternalServiceErrorPage', () => {
  let component: ExternalServiceErrorPage;
  let fixture: ComponentFixture<ExternalServiceErrorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExternalServiceErrorPage,
        createTranslocoTestingModule({
          langs: {
            de: {},
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalServiceErrorPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
