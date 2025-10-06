import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorDto {
  id: string;
  isFrontendError: boolean;
  i18nTitle: TranslationItem;
  i18nReason: TranslationItem;
  i18nPath?: TranslationItem;
  i18nErrorId?: TranslationItem;
  originalError: Error | HttpErrorResponse;
  timestamp: Date;
  isHandled: boolean;
  url?: string;
  method?: string;
}

export interface TranslationItem {
  i18n: string;
  i18nParameter?: Record<string, string>;
}
