import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * The root Angular component that renders the application shell. It provides the router outlet as
 * the placeholder for dynamic routes.
 *
 * CommentLastReviewed: 2025-10-03
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet],
})
export class AppComponent {}
