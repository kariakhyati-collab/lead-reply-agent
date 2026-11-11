import { describe, expect, it } from "vitest";

import { CATALOG_SKUS } from "@/data/catalog";
import { DEMO_RESULTS } from "@/data/demo-results";
import { SAMPLES } from "@/data/samples";

import { containsPrice, enforceGuardrails } from "./catalog-match";
import { findDemoResult, normalizeEnquiry } from "./demo";
import { AnalysisSchema } from "./schema";

describe("findDemoResult", () => {
  it("has a result for every sample", () => {
    for (const s of SAMPLES) {
      expect(findDemoResult(s.text, s.id)?.sampleId).toBe(s.id);
    }
  });

  it("matches sample text regardless of whitespace, case and line endings", () => {
    const sample = SAMPLES[0];
    const messy = `  ${sample.text.replace(/\n/g, "\r\n   ").toUpperCase()}  `;
    expect(findDemoResult(messy)?.sampleId).toBe(sample.id);
  });

  it("ignores a stale sample id when the text was edited", () => {
    const sample = SAMPLES[0];
    expect(findDemoResult(`${sample.text}\nP.S. also need rivets`, sample.id)).toBeNull();
  });

  it("returns null for custom text", () => {
    expect(findDemoResult("Hello, I need 500 M8 bolts")).toBeNull();
  });

  it("uses the text, not the claimed id, when they disagree", () => {
    expect(findDemoResult(SAMPLES[1].text, SAMPLES[0].id)?.sampleId).toBe(SAMPLES[1].id);
  });
});

describe("normalizeEnquiry", () => {
  it("collapses whitespace", () => {
    expect(normalizeEnquiry(" A\r\n\tB  c ")).toBe("a b c");
  });
});

describe("demo results", () => {
  it.each(Object.entries(DEMO_RESULTS))("%s is schema-valid, catalogue-grounded and price-free", (_id, result) => {
    expect(AnalysisSchema.safeParse(result).success).toBe(true);
    for (const p of result.requirements.products) {
      if (p.sku) expect(CATALOG_SKUS.has(p.sku)).toBe(true);
    }
    expect(containsPrice(result.reply.body)).toBe(false);
    const { warnings } = enforceGuardrails(result);
    expect(warnings.length).toBe(result.injection_detected ? 1 : 0);
  });

  it("flags the injection sample as spam", () => {
    expect(DEMO_RESULTS["spam-injection"]).toMatchObject({ tier: "spam", injection_detected: true, score: 0 });
  });
});
