import { z } from "zod";

export const JobDescriptionSchema = z.object({
  title: z.string().default("Unknown Position"),
  required_skills: z.array(z.string()).default([]),
  preferred_skills: z.array(z.string()).default([]),
  experience_required: z.coerce.number().default(0),
  role_level: z.string().default("mid"),
});

export type JobDescription = z.infer<typeof JobDescriptionSchema>;

export interface JobDescriptionDoc extends JobDescription {
  raw_text: string;
  parsed_at: Date;
}
