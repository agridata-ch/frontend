import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { version } from '../../package.json';
import { DataRequestComponent } from './features/data-request/data-request.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, DataRequestComponent],
})
export class AppComponent {
  public version;

  constructor() {
    this.version = version;
  }
}
