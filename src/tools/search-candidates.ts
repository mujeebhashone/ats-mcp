import { z } from "zod";
import { candidates } from "../db.js";
import type { Filter } from "mongodb";

export const searchCandidatesInput = {
  skills: z.array(z.string()).optional().describe("Filter by skills (candidate must have ALL listed skills)"),
  min_exp: z.number().optional().describe("Minimum years of experience"),
  location: z.string().optional().describe("Location filter (case-insensitive partial match)"),
  limit: z.number().optional().default(20).describe("Max number of results (default 20)"),
};

export async function searchCandidates(args: {
  skills?: string[];
  min_exp?: number;
  location?: string;
  limit?: number;
}): Promise<string> {
  const filter: Filter<any> = {};

  if (args.skills && args.skills.length > 0) {
    filter.skills = { $all: args.skills.map((s) => s.toLowerCase().trim()) };
  }

  if (args.min_exp !== undefined) {
    filter.years_exp = { $gte: args.min_exp };
  }

  if (args.location) {
    filter.location = { $regex: args.location, $options: "i" };
  }

  const results = await candidates()
    .find(filter)
    .limit(args.limit || 20)
    .project({ raw_text: 0 })
    .toArray();

  return JSON.stringify(
    {
      total_found: results.length,
      filters_applied: {
        skills: args.skills || [],
        min_exp: args.min_exp ?? null,
        location: args.location ?? null,
      },
      candidates: results.map((c) => ({
        candidate_id: c._id.toString(),
        name: c.name,
        email: c.email,
        location: c.location,
        skills: c.skills,
        years_exp: c.years_exp,
        experience: c.experience,
      })),
    },
    null,
    2
  );
}
