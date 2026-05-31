import { parse } from 'yaml';
import type { SpecDocument } from '../types/spec';
import { SPEC_PHASES, type SpecPhaseSlug } from '../config/specPhases';

const base = import.meta.env.BASE_URL;

export async function fetchSpecDocument(slug: string): Promise<SpecDocument | null> {
  const phase = SPEC_PHASES.find((p) => p.slug === slug);
  if (!phase) return null;

  const url = `${base}spec/${phase.file}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const text = await res.text();
  const doc = parse(text) as SpecDocument;
  if (!doc?.slug) return null;
  return doc;
}

export function isValidSpecSlug(slug: string): slug is SpecPhaseSlug {
  return SPEC_PHASES.some((p) => p.slug === slug);
}
