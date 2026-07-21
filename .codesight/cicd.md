# CI/CD Pipelines

## GitHub Actions (14 workflows)

| Workflow               | Triggers                        | Jobs | Deploy | Environments |
| ---------------------- | ------------------------------- | ---- | ------ | ------------ |
| CI/CD Pipeline develop | pull_request, push, merge_group | 8    | —      | —            |
| CI/CD Pipeline main    | pull_request, push, merge_group | 9    | —      | —            |
| Storybook Deploy       | push                            | 2    | s3     | —            |
| Manual Deployment      | workflow_dispatch               | 3    | —      | —            |
| Renovate Bot           | workflow_dispatch, schedule     | 1    | —      | —            |

### CI/CD Pipeline develop

> `.github/workflows/ci_cd_pipeline_develop.yml`

- **check-single-commit** — 1 steps
  - `./.github/workflows/reusable__check_single_commit.yml`
- **check-comments** — 1 steps (needs: check-single-commit)
  - `./.github/workflows/reusable__check_comments.yml`
- **gitleaks** — 1 steps (needs: check-single-commit)
  - `./.github/workflows/reusable__gitleaks.yml`
- **unit-test-sonarqube** — 1 steps (needs: check-comments, gitleaks)
  - `./.github/workflows/reusable__unit_test_sonarqube.yml`
- **semantic-release** — 1 steps (needs: unit-test-sonarqube)
  - `./.github/workflows/reusable__semantic_release.yml`
- **read-version** — 1 steps (needs: semantic-release)
  - `./.github/workflows/reusable__read_version.yml`
- **build-push-s3** — 1 steps (needs: read-version)
  - `./.github/workflows/reusable__build_push_s3.yml`
- **set-cloudfront-origin-path** — 1 steps (needs: read-version, build-push-s3)
  - `./.github/workflows/reusable__set_cloudfront_origin_path.yml`

### CI/CD Pipeline main

> `.github/workflows/ci_cd_pipeline_main.yml`

- **unit-test-sonarqube** — 1 steps
  - `./.github/workflows/reusable__unit_test_sonarqube.yml`
- **gitleaks** — 1 steps
  - `./.github/workflows/reusable__gitleaks.yml`
- **semantic-release** — 1 steps (needs: unit-test-sonarqube, gitleaks)
  - `./.github/workflows/reusable__semantic_release.yml`
- **read-version** — 1 steps (needs: semantic-release)
  - `./.github/workflows/reusable__read_version.yml`
- **build-push-s3-testing** — 1 steps (needs: read-version)
  - `./.github/workflows/reusable__build_push_s3.yml`
- **set-cloudfront-origin-path-testing** — 1 steps (needs: read-version, build-push-s3-testing)
  - `./.github/workflows/reusable__set_cloudfront_origin_path.yml`
- **build-push-s3-integration** — 1 steps (needs: read-version)
  - `./.github/workflows/reusable__build_push_s3.yml`
- **set-cloudfront-origin-path-integration** — 1 steps (needs: read-version, build-push-s3-integration)
  - `./.github/workflows/reusable__set_cloudfront_origin_path.yml`
- **merge-main-develop** — 1 steps (needs: semantic-release)
  - `./.github/workflows/reusable__merge_main_develop.yml`

### Storybook Deploy

> `.github/workflows/ci_cd_pipeline_storybook.yml`

- **build-push-s3** on `ubuntu-latest` — 7 steps → **s3**
  - `actions/checkout@v7`
  - `aws-actions/configure-aws-credentials@v6`
  - `actions/setup-node@v7`
- **invalidate-cloudfront** on `ubuntu-latest` — 2 steps (needs: build-push-s3)
  - `aws-actions/configure-aws-credentials@v6`

### Manual Deployment

> `.github/workflows/manual_deployment.yml`

- **resolve-inputs** on `ubuntu-latest` — 1 steps
- **build-push-s3** — 1 steps (needs: resolve-inputs)
  - `./.github/workflows/reusable__build_push_s3.yml`
- **set-cloudfront-origin-path** — 1 steps (needs: build-push-s3, resolve-inputs)
  - `./.github/workflows/reusable__set_cloudfront_origin_path.yml`

### Reusable Workflows

- `.github/workflows/reusable__build_push_s3.yml` — reusable\_\_build_push_s3 (build-push-s3)
- `.github/workflows/reusable__check_comments.yml` — reusable\_\_check_comments (check-comments)
- `.github/workflows/reusable__check_single_commit.yml` — reusable\_\_check_single_commit (check-single-commit)
- `.github/workflows/reusable__gitleaks.yml` — reusable\_\_gitleaks (git-leaks)
- `.github/workflows/reusable__merge_main_develop.yml` — reusable\_\_merge_main_develop (merge-main-develop)
- `.github/workflows/reusable__read_version.yml` — reusable\_\_read_version (read-version)
- `.github/workflows/reusable__semantic_release.yml` — reusable\_\_semantic_release (semantic-release)
- `.github/workflows/reusable__set_cloudfront_origin_path.yml` — reusable\_\_set_cloudfront_origin_path (set-cloudfront-origin-path)
- `.github/workflows/reusable__unit_test_sonarqube.yml` — reusable\_\_unit_test_sonarqube (unit-test-sonarqube)

### Secrets

- `FONTAWESOME_PACKAGE_TOKEN`
- `GITHUB_TOKEN`
- `LICENSE_KEY_GITLEAKS`
- `PRIVATE_KEY_GITHUB_APP_GITLEAKS`
- `PRIVATE_KEY_GITHUB_APP_RENOVATE_BOT`
- `PRIVATE_KEY_GITHUB_APP_SEMANTIC_RELEASE`
- `SONAR_TOKEN`

---

_Source: .github/workflows/ci_cd_pipeline_develop.yml, .github/workflows/ci_cd_pipeline_main.yml, .github/workflows/ci_cd_pipeline_storybook.yml, .github/workflows/manual_deployment.yml, .github/workflows/renovate_bot.yml, .github/workflows/reusable**build_push_s3.yml, .github/workflows/reusable**check_comments.yml, .github/workflows/reusable**check_single_commit.yml, .github/workflows/reusable**gitleaks.yml, .github/workflows/reusable**merge_main_develop.yml, .github/workflows/reusable**read_version.yml, .github/workflows/reusable**semantic_release.yml, .github/workflows/reusable**set_cloudfront_origin_path.yml, .github/workflows/reusable\_\_unit_test_sonarqube.yml_
_Generated by codesight-cicd-plugin_
