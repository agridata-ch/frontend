import { Injectable } from '@angular/core';
import { AbstractSecurityStorage } from 'angular-auth-oidc-client';

@Injectable({ providedIn: 'root' })
export class AgridataOIDCStorage implements AbstractSecurityStorage {
  read(key: string) {
    return localStorage.getItem(key);
  }
  write(key: string, data: string) {
    localStorage.setItem(key, data);
  }
  remove(key: string) {
    localStorage.removeItem(key);
  }
  clear() {
    localStorage.clear();
  }
}
