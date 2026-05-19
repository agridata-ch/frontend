import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
  createMockAuthService,
  MockAuthService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DefaultLayoutComponent } from './default-layout.component';

describe('DefaultLayoutComponent', () => {
  let fixture: ComponentFixture<DefaultLayoutComponent>;
  let component: DefaultLayoutComponent;
  let authService: MockAuthService;
  let stateService: MockAgridataStateService;

  beforeEach(async () => {
    authService = createMockAuthService();
    stateService = createMockAgridataStateService();

    await TestBed.configureTestingModule({
      imports: [
        DefaultLayoutComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        createTranslocoTestingModule(),
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AgridataStateService, useValue: stateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
  });

  describe('navigation state', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('isNavigationOpen is closed by default', () => {
      expect(component['isNavigationOpen']()).toBe(false);
    });

    it('isNavigationOpen reflects userPreferences.mainMenuOpened', () => {
      stateService.__testSignals.userPreferences.update((pref) => ({
        ...pref,
        mainMenuOpened: true,
      }));

      expect(component['isNavigationOpen']()).toBe(true);
    });

    it('showNavigation reflects AuthService.isAuthenticated()', () => {
      authService.__testSignals.isAuthenticated.set(true);
      expect(component['showNavigation']()).toBe(true);

      authService.__testSignals.isAuthenticated.set(false);
      expect(component['showNavigation']()).toBe(false);
    });
  });

  describe('cookie banner', () => {
    it('showCookieBanner is shown by default', () => {
      expect(component['showCookieBanner']()).toBe(true);
    });

    it('showCookieBanner reflects agridataStateService.showCookiebanner()', () => {
      stateService.__testSignals.showCookiebanner.set(false);
      expect(component['showCookieBanner']()).toBe(false);

      stateService.__testSignals.showCookiebanner.set(true);
      expect(component['showCookieBanner']()).toBe(true);
    });
  });

  describe('navigation icon', () => {
    it('navIcon is chevron-right when navigation is closed', () => {
      stateService.__testSignals.userPreferences.update((pref) => ({
        ...pref,
        mainMenuOpened: false,
      }));

      const icon = component['navIcon']();
      expect(icon).toBeDefined();
      expect(icon.iconName).toBe('chevron-right');
    });

    it('navIcon is chevron-left when navigation is open', () => {
      stateService.__testSignals.userPreferences.update((pref) => ({
        ...pref,
        mainMenuOpened: true,
      }));

      const icon = component['navIcon']();
      expect(icon).toBeDefined();
      expect(icon.iconName).toBe('chevron-left');
    });
  });

  describe('toggle navigation', () => {
    it('toggleNavigation calls setMainMenuOpened with true when closed', () => {
      stateService.__testSignals.userPreferences.update((pref) => ({
        ...pref,
        mainMenuOpened: false,
      }));

      component['toggleNavigation']();

      expect(stateService.setMainMenuOpened).toHaveBeenCalledWith(true);
    });

    it('toggleNavigation calls setMainMenuOpened with false when open', () => {
      stateService.__testSignals.userPreferences.update((pref) => ({
        ...pref,
        mainMenuOpened: true,
      }));

      component['toggleNavigation']();

      expect(stateService.setMainMenuOpened).toHaveBeenCalledWith(false);
    });
  });
});
