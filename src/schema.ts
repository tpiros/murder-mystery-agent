import { z } from "zod";

export const verdictSchema = z.object({
  verdict: z.object({
    murderer: z.string(),
    confidence: z.number().min(0).max(100),
    motive: z.string(),
  }),
  evidenceChain: z.array(
    z.object({
      item: z.string(),
      implicates: z.string(),
      significance: z.string(),
    })
  ),
  suspectRankings: z.array(
    z.object({
      name: z.string(),
      suspicionScore: z.number().min(0).max(100),
      alibiStatus: z.enum(["verified", "unverified", "broken"]),
      motive: z.string().nullable(),
    })
  ),
  keyDeductions: z.array(z.string()),
});

export type Verdict = z.infer<typeof verdictSchema>;
