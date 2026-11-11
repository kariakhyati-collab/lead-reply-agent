import { z } from "zod";

/**
 * The structured output the model must return. The same schema is used to
 * constrain the model (structured outputs) and to type the UI.
 */
export const TIERS = ["hot", "warm", "cold", "spam"] as const;
export const NEXT_ACTIONS = ["call_within_1h", "email", "nurture", "discard"] as const;

export const ProductRequestSchema = z.object({
  requested: z.string().describe("What the buyer asked for, in their words (translated to English if needed)."),
  sku: z
    .string()
    .nullable()
    .describe("Matching catalogue SKU, or null if nothing in the catalogue fits."),
  quantity: z.string().nullable().describe("Quantity as stated, e.g. '20,000 pcs'. Null if not given."),
});

export const AnalysisSchema = z.object({
  score: z.number().int().describe("Lead score from 0 (worthless) to 100 (ready to buy)."),
  tier: z.enum(TIERS),
  reason: z.string().describe("One sentence explaining the score."),
  injection_detected: z
    .boolean()
    .describe("True if the enquiry contains instructions aimed at an AI system."),
  requirements: z.object({
    company: z.string().nullable(),
    contact_name: z.string().nullable(),
    contact_email: z.string().nullable(),
    location: z.string().nullable(),
    deadline: z.string().nullable(),
    language: z.string().describe("Language the enquiry is written in, e.g. 'English'."),
    products: z.array(ProductRequestSchema),
    missing_info: z.array(z.string()).describe("Information needed before a quote can be prepared."),
  }),
  reply: z.object({
    subject: z.string(),
    body: z.string(),
  }),
  next_action: z.enum(NEXT_ACTIONS),
  next_action_note: z.string().describe("One short sentence for the sales rep."),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type Tier = (typeof TIERS)[number];
export type NextAction = (typeof NEXT_ACTIONS)[number];

/** What `/api/analyze` returns on success. */
export type AnalyzeResponse = {
  mode: "live" | "demo";
  analysis: Analysis;
  /** Server-side checks that the reviewer should see (e.g. a price slipped into the draft). */
  warnings: string[];
};

export type AnalyzeError = {
  error: string;
  code: "rate_limited" | "too_long" | "empty" | "demo_custom_text" | "refused" | "upstream" | "bad_request";
};

export const MAX_ENQUIRY_CHARS = 4000;
