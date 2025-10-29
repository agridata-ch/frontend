import { computed, effect, inject, Injectable, OnDestroy, signal, untracked } from '@angular/core';

import { ErrorDto } from '@/app/error/error-dto';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DebugLogEntry, DebugLogSource, DebugLogStatus } from '@/features/debug/debug.model';

export interface RequestInfo {
  url: string;
  method: string;
  timestamp: Date;
}

export interface ResponseInfo {
  url: string;
  method: string;
  status: number;
  statusText: string;
  timestamp: Date;
  isError: boolean;
  requestId?: string;
}

/**
 * A service to keep track of HTTP requests and responses for debugging purposes.
 * This can be expanded to include more details as needed.
 * All methods are designed to fail silently to avoid impacting the main application flow.
 *
 * CommentLastReviewed: 2025-10-13
 */
@Injectable({
  providedIn: 'root',
})
export class DebugService implements OnDestroy {
  private readonly stateService = inject(AgridataStateService);
  private readonly errorService = inject(ErrorHandlerService);

  private requests: RequestInfo[] = [];
  private responses: ResponseInfo[] = [];
  private readonly routeNavigations = signal<DebugLogEntry[]>([]);
  private cleanupInterval?: ReturnType<typeof setInterval>;

  constructor() {
    try {
      this.startCleanupInterval();
      this.setupRouteTracking();
    } catch (error) {
      console.warn('DebugService initialization failed:', error);
    }
  }

  addRequest(url: string, method: string): void {
    try {
      if (!url || !method) {
        return;
      }
      this.requests.push({
        url: String(url),
        method: String(method),
        timestamp: new Date(),
      });
    } catch {}
  }

  addResponse(
    url: string,
    method: string,
    status: number,
    statusText: string,
    isError: boolean,
    requestId?: string,
  ): void {
    try {
      if (!url || !method) {
        return;
      }
      this.responses.push({
        url: String(url),
        method: String(method),
        status: Number(status) || 0,
        statusText: String(statusText || ''),
        timestamp: new Date(),
        isError: Boolean(isError),
        requestId: requestId ? String(requestId) : undefined,
      });
    } catch {}
  }

  getRequests(): RequestInfo[] {
    try {
      return [...this.requests];
    } catch {
      return [];
    }
  }

  getResponses(): ResponseInfo[] {
    try {
      return [...this.responses];
    } catch {
      return [];
    }
  }

  private startCleanupInterval(): void {
    try {
      this.cleanupInterval = setInterval(() => {
        try {
          this.removeOldEntries();
        } catch {}
      }, 60000); // Check every minute
    } catch {}
  }

  private removeOldEntries(): void {
    try {
      // Sort by timestamp (newest first) and keep only the last 10
      if (Array.isArray(this.requests) && this.requests.length > 10) {
        this.requests = this.requests
          .filter((r) => r?.timestamp instanceof Date)
          .sort((a, b) => {
            try {
              return b.timestamp.getTime() - a.timestamp.getTime();
            } catch {
              return 0;
            }
          })
          .slice(0, 10);
      }

      if (Array.isArray(this.responses) && this.responses.length > 10) {
        this.responses = this.responses
          .filter((r) => r?.timestamp instanceof Date)
          .sort((a, b) => {
            try {
              return b.timestamp.getTime() - a.timestamp.getTime();
            } catch {
              return 0;
            }
          })
          .slice(0, 10);
      }

      // Clean up old route navigations
      try {
        this.routeNavigations.update((entries) => {
          if (!Array.isArray(entries) || entries.length <= 10) {
            return entries;
          }
          return entries
            .filter((e) => e?.timestamp instanceof Date)
            .sort((a, b) => {
              try {
                return b.timestamp.getTime() - a.timestamp.getTime();
              } catch {
                return 0;
              }
            })
            .slice(0, 10);
        });
      } catch {}
    } catch {}
  }

  debugLogs = computed(() => {
    try {
      const errors = this.errorService?.getAllErrors?.();
      const requests = this.getRequests();
      const responses = this.getResponses();
      const routes = this.routeNavigations();

      const errorEntries = Array.isArray(errors?.())
        ? errors()
            .map((error) => this.mapErrorToLogEntry(error))
            .filter(Boolean)
        : [];
      const requestEntries = Array.isArray(requests)
        ? requests.map((request) => this.mapRequestToLogEntry(request)).filter(Boolean)
        : [];
      const responseEntries = Array.isArray(responses)
        ? responses.map((response) => this.mapResponseToLogEntry(response)).filter(Boolean)
        : [];
      const routeEntries = Array.isArray(routes) ? routes : [];

      return [...errorEntries, ...requestEntries, ...responseEntries, ...routeEntries]
        .filter((entry): entry is DebugLogEntry => entry !== null && entry !== undefined)
        .sort((a, b) => {
          try {
            if (!a?.timestamp || !b?.timestamp) return 0;
            return b.timestamp.getTime() - a.timestamp.getTime();
          } catch {
            return 0;
          }
        });
    } catch {
      return [];
    }
  });

  private setupRouteTracking(): void {
    try {
      this.trackRouteSignal(() => this.stateService?.routeStart?.(), DebugLogSource.ROUTE_START);
      this.trackRouteSignal(() => this.stateService?.currentRoute?.(), DebugLogSource.ROUTE_END);
    } catch {}
  }

  private trackRouteSignal(getRouteSignal: () => unknown, source: DebugLogSource): void {
    try {
      effect(() => {
        try {
          const route = getRouteSignal();
          if (route) {
            untracked(() => {
              try {
                this.addRouteLogEntry(route, source);
              } catch {}
            });
          }
        } catch {}
      });
    } catch {}
  }

  private addRouteLogEntry(route: unknown, source: DebugLogSource): void {
    try {
      if (!route || !source) {
        return;
      }
      this.routeNavigations.update((entries) => [
        ...(Array.isArray(entries) ? entries : []),
        {
          timestamp: new Date(),
          message: typeof route === 'object' ? JSON.stringify(route) : String(route),
          source,
          status: DebugLogStatus.INFO,
        },
      ]);
    } catch {}
  }

  private mapErrorToLogEntry(errorDto: ErrorDto): DebugLogEntry | null {
    try {
      if (!errorDto?.originalError || !errorDto?.timestamp) {
        return null;
      }

      const originalMessage = errorDto.originalError.message;
      const formattedMessage =
        typeof originalMessage === 'object'
          ? JSON.stringify(originalMessage)
          : String(originalMessage || 'Unknown error');

      const i18nTitle = errorDto.i18nTitle?.i18n || 'Error';
      const message = `${i18nTitle} - ${formattedMessage} | isFe: ${Boolean(errorDto.isFrontendError)}, handled: ${Boolean(errorDto.isHandled)}`;

      return {
        timestamp: errorDto.timestamp,
        message,
        source: DebugLogSource.ERROR,
        status: DebugLogStatus.ERROR,
      };
    } catch {
      return null;
    }
  }

  private mapRequestToLogEntry(request: RequestInfo): DebugLogEntry | null {
    try {
      if (!request?.url || !request?.method || !request?.timestamp) {
        return null;
      }

      return {
        timestamp: request.timestamp,
        message: `${request.method}: ${request.url}`,
        source: DebugLogSource.REQUEST,
        status: DebugLogStatus.INFO,
      };
    } catch {
      return null;
    }
  }

  private mapResponseToLogEntry(response: ResponseInfo): DebugLogEntry | null {
    try {
      if (!response?.url || !response?.method || !response?.timestamp) {
        return null;
      }

      let message = `${response.status} ${response.statusText || ''} - ${response.url}`;
      if (response.requestId) {
        message += ` | requestId: ${response.requestId}`;
      }

      return {
        timestamp: response.timestamp,
        message,
        source: DebugLogSource.RESPONSE,
        status: response.isError ? DebugLogStatus.ERROR : DebugLogStatus.SUCCESS,
      };
    } catch {
      return null;
    }
  }

  ngOnDestroy(): void {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = undefined;
      }
    } catch {}
  }
}
