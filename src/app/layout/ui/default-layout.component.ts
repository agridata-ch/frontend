import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { version } from '../../../../package.json';

// reuse your widgets / shared UI
// import { HeaderWidgetComponent } from '@widgets/HeaderWidget/ui/header.widget';
// import { NavigationWidgetComponent } from '@widgets/NavigationWidget/ui/navigation.widget';
// import { FooterWidgetComponent } from '@widgets/FooterWidget/ui/footer.widget';

@Component({
  standalone: true,
  selector: 'app-default-layout',
  imports: [
    CommonModule,
    RouterModule, // for <router-outlet> and routerLink
    // HeaderWidgetComponent,
    // NavigationWidgetComponent,
    // FooterWidgetComponent,
  ],
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css'],
})
export class DefaultLayoutComponent {
  public version;

  constructor() {
    this.version = version;
  }
}
