# agridata.ch Frontend
This is the frontend of agridata.ch. The frontend is built with Angular and Typescript.

# Installation
## Requirements
- Node.js (>= 20.0.0)
- npm (>= 10.0.0)

## Installation
1. Clone the repository
```bash
git clone https://github.com/agridata-ch/frontend.git
cd frontend
```
2. Install dependencies
```bash
npm install
```
3. Start the development server
```bash
npm run start
```

# Commit message convention
In this project we use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages. This means that each commit message should start with a type, followed by an optional scope and a description. The type can be one of the following:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing or correcting existing tests
- build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- chore: Other changes that don't modify src or test files
- revert: Reverts a previous commit
- WIP: Work in progress
- BREAKING CHANGE: A commit that introduces a breaking change

# Deployment
We use [semantic-release](https://semantic-release.gitbook.io/semantic-release/) to automatically version and to generate the release notes. After a merge into the develop branch, the version is automatically increased and a new pre-release is created. After a merge into the main branch, the version is automatically increased and a new release is created. Also the main branch is automatically merged back into develop. The release notes are generated automatically based on the commit messages. The release notes are generated in the CHANGELOG.md file.

# API-Client Generation
We use [openapi-generator](https://openapi-generator.tech/) to generate the API client. The API client is generated from the OpenAPI specification file located in the `src/assets/openapi` folder. The OpenAPI specification file is generated from the backend using [swagger-ui](https://swagger.io/tools/swagger-ui/). The API client is generated using the following command:
```bash
npm run generate:api
```
The generated API client is located in the `src/app/shared/services` and the models are located in the `src/app/shared/models` folder.
You can then import the API client in your component-services and use it to make API calls.

# Translation
## Transloco
We use [transloco](https://jsverse.gitbook.io/transloco) for translations. The translation files are located in the `src/assets/i18n` folder. The translation files are in JSON format and can be edited directly. 

## I18nService | I18nPipe
We have our custom I18n Service and Pipe to use the translations in the application. The I18nService is a wrapper around the Transloco service and provides a simple interface to get the translations. The I18nPipe is a wrapper around the Transloco pipe and can be used in the templates to get the translations.
You can use the I18nPipe in your templates like this:
```html
<p>{{ 'hello' | i18n }}</p>
```
in the json file:
```json
{
  "hello": "Hello World"
}
```
or use it with a prefix
```html
<ng-container *transloco="let t; prefix: 'agridata'">
  <p>{{ t('title') }}</p>
</ng-container>
```
this is useful if don't want to add the namespace to every translation key. In the json file this will then be like this:
```json
{
  "agridata": {
    "title": "Agridata Title"
  }
}
```
## Transloco Key Manager
We use the [Transloco Key Manager](https://jsverse.gitbook.io/transloco/advanced/key-manager) to manage the translation keys. The key manager is a command line tool that scans the code for translation keys and generates a report of missing keys. You can run the key manager with the following command:
```bash
npm run transloco:keys
```
This will add all the missing keys to the translation files. 

> [!WARNING] The actual version of transloco (v.14) won't work with Angular 20 because the transloco dependency is not updated fully to Angular 20 yet.
