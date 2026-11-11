import { describe, expect, it } from "vitest";

import { DEMO_RESULTS } from "@/data/demo-results";

import { containsPrice, enforceGuardrails, matchSku, normalizeSku } from "./catalog-match";

describe("SKU matching", () => {
  it("normalises case, whitespace and dash variants", () => {
    expect(normalizeSku(" nwf–hb_a4 ")).toBe("NWF-HB-A4");
  });
  it("accepts known SKUs and rejects invented ones", () => {
    expect(matchSku("nwf-hb-a4")).toBe("NWF-HB-A4");
    expect(matchSku("NWF-HB-A9")).toBeNull();
    expect(matchSku(null)).toBeNull();
    expect(matchSku("")).toBeNull();
  });
});

describe("containsPrice", () => {
  it.each([
    "Unit price is £0.42 each",
    "That comes to 1,250.00 EUR",
    "USD 300 for the lot",
    "We can do 12.50 per 100",
    "€ 9,99",
  ])("flags %s", (text) => {
    expect(containsPrice(text)).toBe(true);
  });

  it.each([
    "M12 x 60 hex bolts, 18,000 pcs",
    "Lead time 3–5 working days, MOQ 500 pcs per size",
    "Our sales desk will send a formal quotation with pricing separately.",
    "Delivery by KW 3/2027",
  ])("does not flag %s", (text) => {
    expect(containsPrice(text)).toBe(false);
  });
});

describe("enforceGuardrails", () => {
  const base = DEMO_RESULTS["hot-rfq"];

  it("clamps the score to 0–100", () => {
    expect(enforceGuardrails({ ...base, score: 140 }).analysis.score).toBe(100);
    expect(enforceGuardrails({ ...base, score: -5 }).analysis.score).toBe(0);
  });

  it("removes invented SKUs and warns", () => {
    const input = {
      ...base,
      requirements: {
        ...base.requirements,
        products: [{ requested: "Titanium bolts", sku: "NWF-TI-01", quantity: "10" }],
      },
    };
    const { analysis, warnings } = enforceGuardrails(input);
    expect(analysis.requirements.products[0].sku).toBeNull();
    expect(warnings[0]).toContain("NWF-TI-01");
  });

  it("warns when a price slips into the draft", () => {
    const input = { ...base, reply: { ...base.reply, body: "Bolts are £0.30 each." } };
    expect(enforceGuardrails(input).warnings.some((w) => w.includes("price"))).toBe(true);
  });

  it("does not mutate its input", () => {
    const input = structuredClone(base);
    enforceGuardrails({ ...input, score: 200 });
    expect(input).toEqual(base);
  });
});
