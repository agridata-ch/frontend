import { AuthService } from '@/shared/services/auth.service';
import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-widget',
  imports: [RouterLink],
  templateUrl: './header-widget.component.html',
  styleUrl: './header-widget.component.css',
})
export class HeaderWidgetComponent {
  constructor(private readonly authService: AuthService) {}

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly userData = computed(() => this.authService.userData());

  login = () => {
    this.authService.login();
  };

  logout = () => {
    this.authService.logout();
  };
}
