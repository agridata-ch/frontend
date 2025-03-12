import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterOutlet
  ],
  standalone: true
})
export class AppComponent implements OnInit {
  title = '';

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getTitle().subscribe({
      next: (response) => {
        this.title = response;
      },
      error: (err) => {
        console.error('Fehler beim Abrufen des Titels:', err);
      }
    });
  }
}
