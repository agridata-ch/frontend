import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ToastComponent } from '@/shared/ui/toast/toast.component';
import { HeaderWidgetComponent } from '@widgets/header-widget/header-widget.component';
import { FooterWidgetComponent } from '@widgets/footer-widget/footer-widget.component';
import { NavigationWidgetComponent } from '@widgets/navigation-widget/navigation-widget.component';

@Component({
  standalone: true,
  selector: 'app-default-layout',
  imports: [
    CommonModule,
    RouterModule,
    HeaderWidgetComponent,
    NavigationWidgetComponent,
    FooterWidgetComponent,
    ToastComponent,
  ],
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css'],
})
export class DefaultLayoutComponent {}
