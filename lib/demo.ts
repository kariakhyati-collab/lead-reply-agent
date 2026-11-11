import { DEMO_RESULTS } from "@/data/demo-results";
import { SAMPLES } from "@/data/samples";
import type { Analysis } from "@/lib/schema";

/** Collapse whitespace and line endings so pasted samples still match. */
export function normalizeEnquiry(text: string): string {
  return text.replace(/\r\n?/g, "\n").replace(/\s+/g, " ").trim().toLowerCase();
}

const SAMPLE_INDEX = new Map(SAMPLES.map((s) => [normalizeEnquiry(s.text), s.id]));

/**
 * Find the pre-computed result for an enquiry when running without an API
 * key. Matches by sample id first, then by (normalised) sample text, so a
 * sample that was edited by the user does not match.
 */
export function findDemoResult(
  text: string,
  sampleId?: string | null,
): { sampleId: string; analysis: Analysis } | null {
  const normalized = normalizeEnquiry(text);
  const idFromText = SAMPLE_INDEX.get(normalized);

  if (sampleId && idFromText === sampleId && DEMO_RESULTS[sampleId]) {
    return { sampleId, analysis: DEMO_RESULTS[sampleId] };
  }
  if (idFromText && DEMO_RESULTS[idFromText]) {
    return { sampleId: idFromText, analysis: DEMO_RESULTS[idFromText] };
  }
  return null;
}
