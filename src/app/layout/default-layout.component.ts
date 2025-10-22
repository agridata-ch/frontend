import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ToastComponent } from '@/shared/ui/toast';
import { FooterWidgetComponent } from '@/widgets/footer-widget';
import { HeaderWidgetComponent } from '@/widgets/header-widget';
import { NavigationWidgetComponent } from '@/widgets/navigation-widget';
import { SupporterOverlayComponent } from '@/widgets/supporter-overlay/supporter-overlay.component';

/**
 * Provides a layout with header, navigation, footer, and toast notifications. It reacts to
 * authentication state changes to refresh the application when users log out or log back in.
 *
 * CommentLastReviewed: 2025-10-06
 */
@Component({
  selector: 'app-default-layout',
  imports: [
    CommonModule,
    RouterModule,
    HeaderWidgetComponent,
    NavigationWidgetComponent,
    FooterWidgetComponent,
    ToastComponent,
    SupporterOverlayComponent,
  ],
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent {}
