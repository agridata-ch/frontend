import { Component, resource } from '@angular/core';
import { DataRequestService } from './data-request.service';

@Component({
  selector: 'app-data-request',
  imports: [],
  templateUrl: './data-request.component.html',
  styleUrl: './data-request.component.css',
})
export class DataRequestComponent {
  constructor(private readonly dataRequestService: DataRequestService) {}

  ngOnInit() {
    resource({
      loader: () => this.dataRequestService.getRequests(),
    });
  }
}
