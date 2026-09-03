import { InjectionToken } from '@angular/core';

export const GA_MEASUREMENT_ID = new InjectionToken<string>('GA_MEASUREMENT_ID');
// we define injection token to enable overriding the URL in tests
export const GA_SCRIPT_URL = new InjectionToken<string>('GA_SCRIPT_URL');
