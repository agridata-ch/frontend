import { Component } from '@angular/core';
import { version } from '../../../package.json';

@Component({
  selector: 'app-footer-widget',
  imports: [],
  templateUrl: './footer-widget.component.html',
  styleUrl: './footer-widget.component.css',
})
export class FooterWidgetComponent {
  public version;

  constructor() {
    this.version = version;
  }
}
