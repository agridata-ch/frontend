import { importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { applicationConfig, type Preview } from '@storybook/angular';

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        importProvidersFrom(
          TranslocoTestingModule.forRoot({
            langs: { de: {} },
            translocoConfig: {
              availableLangs: ['de'],
              defaultLang: 'de',
            },
            preloadLangs: true,
          }),
        ),
      ],
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
