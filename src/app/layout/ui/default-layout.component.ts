import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// reuse your widgets / shared UI
import { HeaderWidgetComponent } from '@widgets/header-widget/header-widget.component';
import { FooterWidgetComponent } from '@widgets/footer-widget/footer-widget.component';
import { NavigationWidgetComponent } from '@widgets/navigation-widget/navigation-widget.component';

@Component({
  standalone: true,
  selector: 'app-default-layout',
  imports: [
    CommonModule,
    RouterModule, // for <router-outlet> and routerLink
    HeaderWidgetComponent,
    NavigationWidgetComponent,
    FooterWidgetComponent,
  ],
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css'],
})
export class DefaultLayoutComponent {}
