import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

interface UserData {
  sub?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
}

@Component({
  selector: 'app-header-widget',
  imports: [RouterLink],
  templateUrl: './header-widget.component.html',
  styleUrl: './header-widget.component.css',
})
export class HeaderWidgetComponent {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  readonly isAuthenticated = signal<boolean>(false);
  readonly userData = signal<UserData | null>(null);

  ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, userData }) => {
      this.isAuthenticated.set(isAuthenticated);
      if (isAuthenticated) {
        this.userData.set(userData);
      } else {
        this.userData.set(null);
      }
    });
  }

  login = () => {
    this.oidcSecurityService.authorize();
  };

  logout = () => {
    this.oidcSecurityService.logoff().subscribe(() => {
      window.sessionStorage.clear();
    });
  };
}
