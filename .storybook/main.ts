import type { StorybookConfig } from '@storybook/angular';
import type { Configuration } from 'webpack';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-onboarding'],
  framework: '@storybook/angular',
  webpackFinal: async (config: Configuration) => {
    // Remove zone.js from entry points for zoneless Angular
    if (Array.isArray(config.entry)) {
      config.entry = config.entry.filter((entry) => !String(entry).includes('zone.js'));
    }

    // Alias zone.js to a no-op to prevent module not found errors
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        'zone.js': false,
      },
    };

    return config;
  },
};
export default config;
