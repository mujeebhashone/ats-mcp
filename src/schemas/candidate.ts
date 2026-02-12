import { z } from "zod";

export const CandidateSchema = z.object({
  name: z.string().default("Unknown"),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string().default(""),
      duration: z.string().default(""),
    })
  ).default([]),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string().default(""),
      year: z.string().default(""),
    })
  ).default([]),
  years_exp: z.coerce.number().default(0),
});

export type Candidate = z.infer<typeof CandidateSchema>;

export interface CandidateDoc extends Candidate {
  raw_text: string;
  parsed_at: Date;
}
