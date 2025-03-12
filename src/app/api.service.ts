import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getTitle(): Observable<string> {
    return this.http.get(environment.apiUrl + "/names", { responseType: 'text' });
  }
}
