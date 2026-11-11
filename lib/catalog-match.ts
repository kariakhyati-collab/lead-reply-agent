import { CATALOG_SKUS } from "@/data/catalog";
import type { Analysis } from "@/lib/schema";

/** Normalise a SKU the model returned: trim, uppercase, unify dashes. */
export function normalizeSku(raw: string): string {
  return raw.trim().toUpperCase().replace(/[‐-―_\s]+/g, "-");
}

/** Return the catalogue SKU if it exists, otherwise null. */
export function matchSku(raw: string | null | undefined, skus: ReadonlySet<string> = CATALOG_SKUS): string | null {
  if (!raw) return null;
  const sku = normalizeSku(raw);
  return skus.has(sku) ? sku : null;
}

// Currency symbol or code next to a number, or "per piece"-style unit prices.
const PRICE_PATTERNS: RegExp[] = [
  /[£$€¥]\s?\d/,
  /\d[\d.,]*\s?(?:£|\$|€|gbp|usd|eur|pence|p\/pc)\b/i,
  /\b(?:gbp|usd|eur)\s?\d/i,
  /\b\d[\d.,]*\s?(?:per|\/)\s?(?:piece|pc|pcs|unit|100|1000)\b/i,
];

/** True if the text appears to contain a price. Used to flag drafts. */
export function containsPrice(text: string): boolean {
  return PRICE_PATTERNS.some((re) => re.test(text));
}

/**
 * Deterministic guardrails applied to every model result before it reaches
 * the UI. The model is instructed to follow these rules; this makes sure.
 */
export function enforceGuardrails(analysis: Analysis): { analysis: Analysis; warnings: string[] } {
  const warnings: string[] = [];

  const products = analysis.requirements.products.map((p) => {
    const sku = matchSku(p.sku);
    if (p.sku && !sku) warnings.push(`Removed unknown SKU "${p.sku}" (not in catalogue).`);
    return { ...p, sku };
  });

  const score = Math.max(0, Math.min(100, Math.round(analysis.score)));

  if (containsPrice(analysis.reply.body) || containsPrice(analysis.reply.subject)) {
    warnings.push("The draft appears to mention a price. Remove it before sending: quotes come from the sales desk.");
  }
  if (analysis.injection_detected) {
    warnings.push("The enquiry contained instructions aimed at the AI. They were treated as data and ignored.");
  }

  return {
    analysis: { ...analysis, score, requirements: { ...analysis.requirements, products } },
    warnings,
  };
}
