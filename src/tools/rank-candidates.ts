import { z } from "zod";
import { ObjectId } from "mongodb";
import { candidates, jobDescriptions } from "../db.js";
import { computeMatch } from "./matching.js";

export const rankCandidatesInput = {
  jd_id: z.string().describe("MongoDB ObjectId of a parsed job description"),
  limit: z.number().optional().default(10).describe("Max number of candidates to return (default 10)"),
};

export async function rankCandidates(args: { jd_id: string; limit?: number }): Promise<string> {
  const jd = await jobDescriptions().findOne({ _id: new ObjectId(args.jd_id) });
  if (!jd) throw new Error(`Job description not found: ${args.jd_id}`);

  const allCandidates = await candidates().find({}).toArray();

  if (allCandidates.length === 0) {
    return JSON.stringify({ message: "No candidates found in the database.", results: [] });
  }

  const ranked = allCandidates
    .map((c) => {
      const match = computeMatch(c as any, jd as any);
      return {
        candidate_id: c._id.toString(),
        name: c.name,
        overall_score: match.overall_score,
        skill_score: match.skill_score,
        experience_score: match.experience_score,
        level_score: match.level_score,
        matched_required_skills: match.matched_required_skills,
        missing_required_skills: match.missing_required_skills,
      };
    })
    .sort((a, b) => b.overall_score - a.overall_score)
    .slice(0, args.limit || 10);

  return JSON.stringify(
    {
      job_title: jd.title,
      total_candidates: allCandidates.length,
      results: ranked,
    },
    null,
    2
  );
}
