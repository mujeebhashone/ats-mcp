import { z } from "zod";
import { ObjectId } from "mongodb";
import { candidates, jobDescriptions } from "../db.js";
import { computeMatch } from "./matching.js";

export const matchResumeJdInput = {
  resume_id: z.string().describe("MongoDB ObjectId of a parsed candidate"),
  jd_id: z.string().describe("MongoDB ObjectId of a parsed job description"),
};

export async function matchResumeJd(args: { resume_id: string; jd_id: string }): Promise<string> {
  const candidate = await candidates().findOne({ _id: new ObjectId(args.resume_id) });
  if (!candidate) throw new Error(`Candidate not found: ${args.resume_id}`);

  const jd = await jobDescriptions().findOne({ _id: new ObjectId(args.jd_id) });
  if (!jd) throw new Error(`Job description not found: ${args.jd_id}`);

  const result = computeMatch(candidate as any, jd as any);

  return JSON.stringify(
    {
      candidate_name: candidate.name,
      job_title: jd.title,
      ...result,
    },
    null,
    2
  );
}
