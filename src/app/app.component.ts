import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { version } from '../../package.json';
import { ConsentRequestComponent } from './features/consent-request/consent-request.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, ConsentRequestComponent],
})
export class AppComponent {
  public version;

  constructor() {
    this.version = version;
  }
}
