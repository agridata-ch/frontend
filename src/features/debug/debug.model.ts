export interface DebugLogEntry {
  timestamp: Date;
  message: string;
  source: DebugLogSource;
  status: DebugLogStatus;
}

export enum DebugLogSource {
  ERROR = 'ERROR',
  REQUEST = 'REQUEST',
  RESPONSE = 'RESPONSE',
  ROUTE_START = 'ROUTE_START',
  ROUTE_END = 'ROUTE_END',
}

export enum DebugLogStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  INFO = 'INFO',
}
