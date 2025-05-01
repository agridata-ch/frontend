import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet],
  standalone: true,
})
export class AppComponent implements OnInit {
  backendMessage = '';

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getBackendMessage().subscribe({
      next: (response) => {
        this.backendMessage = response;
      },
      error: (err) => {
        console.error('Error contacting the backend', err);
      },
    });
  }
}
