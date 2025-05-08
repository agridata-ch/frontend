import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { RouterOutlet } from '@angular/router';
import { version } from '../../package.json';
import { DataRequestComponent } from './features/data-request/data-request.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, DataRequestComponent],
})
export class AppComponent implements OnInit {
  backendMessage = '';
  public version;

  constructor(private readonly apiService: ApiService) {
    this.version = version;
  }

  ngOnInit(): void {}
}
