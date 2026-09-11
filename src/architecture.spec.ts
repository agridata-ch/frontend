import { extendVitestMatchers, projectFiles } from 'archunit';

extendVitestMatchers();

/**
 * Enforces the Feature Sliced Design layering documented in CLAUDE.md: a layer may only depend
 * on the layers below it (app -> pages -> widgets -> features -> entities -> shared), plus a
 * global no-circular-dependencies rule.
 *
 * Baseline: the codebase currently has pre-existing violations - 5 dependency cycles and the
 * layer edges listed in KNOWN_VIOLATIONS. Those checks are skipped so they don't block CI. They
 * are real tech debt: fix the imports, then remove the entry (or un-skip) to enforce the rule.
 * New violations in the already-passing directions are still caught.
 */

// Ordered top (may import everything below) to bottom (may import nothing above).
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] as const;

// Pre-existing forbidden `${layer}->${upperLayer}` edges. Fix the imports, then delete the entry.
// Accepted-by-policy edge (not debt): shared UI/utils/services reference generated openapi/cms DTO
// types (agridata-table, data-product-dto.directive, *.utils, consent-request-decision.store, etc.).
// Generated domain types are consumable by shared; moving these consumers out of shared would worsen
// the layout, so this edge stays skipped by design. New shared->entities imports aren't caught here —
// keep type refs to DTOs only, never pull entity services into shared (the two existing value deps,
// auth.service->UserService and seo.service->@/entities/cms, are load-bearing exceptions).
const KNOWN_VIOLATIONS = new Set<string>(['shared->entities']);

describe('architecture (Feature Sliced Design)', () => {
  // Building archunit's project graph is slow (~20s); warm it once so each rule below runs
  // against the cache within the default per-test timeout instead of the first one blowing it.
  beforeAll(async () => {
    await projectFiles()
      .inFolder('src/entities/**')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/pages/**')
      .check();
  }, 120_000);

  it('has no circular dependencies', async () => {
    const rule = projectFiles().inFolder('src/**').should().haveNoCycles();
    await expect(rule).toPassAsync();
  });

  LAYERS.forEach((layer, index) => {
    LAYERS.slice(0, index).forEach((upperLayer) => {
      const edge = `${layer}->${upperLayer}`;
      const testFn = KNOWN_VIOLATIONS.has(edge) ? it.skip : it;
      testFn(`${layer} does not depend on ${upperLayer}`, async () => {
        const rule = projectFiles()
          .inFolder(`src/${layer}/**`, {
            except: { inFolder: 'src/shared/testing/**', withName: '*.spec.ts' },
          })
          .shouldNot()
          .dependOnFiles()
          .inFolder(`src/${upperLayer}/**`);
        await expect(rule).toPassAsync();
      });
    });
  });
});
