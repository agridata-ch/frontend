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
