import { TestBed } from '@angular/core/testing';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

import { getTranslocoModule } from './src/app/transloco-testing.module';

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [getTranslocoModule()],
  });
});

setupZonelessTestEnv();
