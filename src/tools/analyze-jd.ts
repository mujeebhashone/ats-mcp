import { z } from "zod";
import { chatJSON } from "../groq.js";
import { jobDescriptions } from "../db.js";
import { JobDescriptionSchema, type JobDescriptionDoc } from "../schemas/job-description.js";
import { JD_SYSTEM_PROMPT } from "../prompts/jd-prompt.js";

export const analyzeJdInput = {
  jd_text: z.string().describe("The full text of a job description/posting"),
};

export async function analyzeJd(args: { jd_text: string }): Promise<string> {
  const raw = await chatJSON<unknown>(JD_SYSTEM_PROMPT, args.jd_text);
  const parsed = JobDescriptionSchema.parse(raw);

  // Normalize skills to lowercase
  parsed.required_skills = parsed.required_skills.map((s) => s.toLowerCase().trim());
  parsed.preferred_skills = parsed.preferred_skills.map((s) => s.toLowerCase().trim());

  const doc: JobDescriptionDoc = {
    ...parsed,
    raw_text: args.jd_text,
    parsed_at: new Date(),
  };

  const result = await jobDescriptions().insertOne(doc);

  return JSON.stringify(
    {
      success: true,
      jd_id: result.insertedId.toString(),
      ...parsed,
    },
    null,
    2
  );
}
