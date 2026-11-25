import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { createMockActivatedRoute } from '@/shared/testing/mocks';
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
      providers: [{ provide: ActivatedRoute, useValue: createMockActivatedRoute() }],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalServiceErrorPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
