import { Injectable } from '@angular/core';
import { AbstractSecurityStorage } from 'angular-auth-oidc-client';

/**
 * Provides a custom storage implementation for persisting authentication data in local storage,
 * ensuring compatibility with the OIDC client library.
 *
 * CommentLastReviewed: 2025-08-25
 */
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
