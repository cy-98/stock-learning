import { SPEC_PHASES, specPath, DEFAULT_SPEC_SLUG } from './specPhases';

export { SPEC_PHASES, specPath, DEFAULT_SPEC_SLUG };

export const SPEC_OVERVIEW_PATH = specPath(DEFAULT_SPEC_SLUG);

export const SPEC_PAGES = SPEC_PHASES.map((p) => ({
  slug: p.slug,
  label: p.label,
  to: specPath(p.slug),
}));
