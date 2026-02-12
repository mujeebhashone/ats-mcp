import { z } from "zod";
import { chatJSON } from "../groq.js";
import { candidates } from "../db.js";
import { CandidateSchema, type CandidateDoc } from "../schemas/candidate.js";
import { RESUME_SYSTEM_PROMPT } from "../prompts/resume-prompt.js";

export const parseResumeInput = {
  resume_text: z.string().describe("The full text content of a resume/CV"),
};

export async function parseResume(args: { resume_text: string }): Promise<string> {
  const raw = await chatJSON<unknown>(RESUME_SYSTEM_PROMPT, args.resume_text);
  const parsed = CandidateSchema.parse(raw);

  // Normalize skills to lowercase
  parsed.skills = parsed.skills.map((s) => s.toLowerCase().trim());

  const doc: CandidateDoc = {
    ...parsed,
    raw_text: args.resume_text,
    parsed_at: new Date(),
  };

  const result = await candidates().insertOne(doc);

  return JSON.stringify(
    {
      success: true,
      candidate_id: result.insertedId.toString(),
      ...parsed,
    },
    null,
    2
  );
}
