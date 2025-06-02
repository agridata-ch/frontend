import { Injectable } from '@angular/core';
import { AbstractSecurityStorage } from 'angular-auth-oidc-client';

@Injectable({ providedIn: 'root' })
export class AgridataOIDCStorage implements AbstractSecurityStorage {
  read(key: string): string | null {
    return localStorage.getItem(key);
  }
  write(key: string, data: string): void {
    localStorage.setItem(key, data);
  }
  remove(key: string): void {
    localStorage.removeItem(key);
  }
  clear(): void {
    localStorage.clear();
  }
}
