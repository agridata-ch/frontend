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

# Add git hook folder

```bash
git config --local core.hooksPath hooks && chmod +x hooks/*
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

# POEditor Translation Sync

This script syncs translations from POEditor with your Angular project.

## Setup

1. Configure your POEditor credentials in `.env` file at the project root:

```bash
POEDITOR_API_TOKEN=your_api_token
POEDITOR_PROJECT_ID=your_project_id
```

You can refer to `.env.example` for the required format.

2. Make sure you have the right language codes set up in POEditor, matching the ones you use in your project.

## Usage

Run the sync command:

```bash
npm run i18n:sync
```

This will:
1. Fetch all available languages from your POEditor project
2. Download the translations for each language
3. Save them to your `src/assets/i18n` directory

## Getting POEditor API Token

1. Log in to your POEditor account
2. Go to your account settings
3. Navigate to the API Access section
4. Generate a new readonly API token or use an existing one

## Getting POEditor Project ID

The project ID can be found in the URL when you're viewing a project:
https://poeditor.com/projects/view?id=YOUR_PROJECT_ID

