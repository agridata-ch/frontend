import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ResourceRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BackendVersionService } from '@/entities/api';
import { MockResources } from '@/shared/testing/mocks';
import { FooterWidgetComponent } from '@/widgets/footer-widget';

describe('FooterWidgetComponent', () => {
  let component: FooterWidgetComponent;
  let openComponent: any;
  let fixture: ComponentFixture<FooterWidgetComponent>;

  let mockBackendVersionService: {
    fetchBackendVersion: ResourceRef<{ [key: string]: string }>;
  };

  beforeEach(async () => {
    mockBackendVersionService = {
      fetchBackendVersion: MockResources.createMockResourceRef({ version: '2.3.4' }),
    };
    await TestBed.configureTestingModule({
      imports: [FooterWidgetComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BackendVersionService, useValue: mockBackendVersionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterWidgetComponent);
    component = fixture.componentInstance;
    openComponent = component as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders FE and BE version', () => {
    const spanEl: HTMLElement = fixture.debugElement.query(
      By.css('.text-agridata-tertiary-text'),
    ).nativeElement;

    expect(spanEl.textContent).toContain(`FE ${openComponent.frontendVersion()}`);
    expect(spanEl.textContent).toContain(`BE ${openComponent.backendVersion().version}`);
  });
});
