import type { Candidate } from "../schemas/candidate.js";
import type { JobDescription } from "../schemas/job-description.js";

const LEVEL_ORDER = [
  "intern",
  "junior",
  "mid",
  "senior",
  "lead",
  "principal",
  "director",
  "vp",
  "c-level",
];

function detectLevel(titles: string[]): string {
  const combined = titles.join(" ").toLowerCase();
  if (combined.includes("intern")) return "intern";
  if (combined.includes("junior") || combined.includes("jr")) return "junior";
  if (combined.includes("principal") || combined.includes("staff")) return "principal";
  if (combined.includes("lead") || combined.includes("architect")) return "lead";
  if (combined.includes("senior") || combined.includes("sr")) return "senior";
  if (combined.includes("director")) return "director";
  if (combined.includes("vp") || combined.includes("vice president")) return "vp";
  if (combined.includes("cto") || combined.includes("ceo") || combined.includes("chief")) return "c-level";
  return "mid";
}

function skillOverlap(candidateSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 1;
  const matched = requiredSkills.filter((s) => candidateSkills.includes(s)).length;
  return matched / requiredSkills.length;
}

export interface MatchResult {
  overall_score: number;
  skill_score: number;
  experience_score: number;
  level_score: number;
  matched_required_skills: string[];
  matched_preferred_skills: string[];
  missing_required_skills: string[];
}

export function computeMatch(candidate: Candidate, jd: JobDescription): MatchResult {
  const cSkills = candidate.skills.map((s) => s.toLowerCase());

  // Skill score (60%): required_match * 0.7 + preferred_match * 0.3
  const requiredMatch = skillOverlap(cSkills, jd.required_skills);
  const preferredMatch = skillOverlap(cSkills, jd.preferred_skills);
  const skill_score = requiredMatch * 0.7 + preferredMatch * 0.3;

  // Experience score (30%): 100% if >= required, scaled down otherwise
  let experience_score: number;
  if (jd.experience_required <= 0) {
    experience_score = 1;
  } else if (candidate.years_exp >= jd.experience_required) {
    experience_score = 1;
  } else {
    experience_score = candidate.years_exp / jd.experience_required;
  }

  // Level score (10%): compare detected level with JD role_level
  const candidateLevel = detectLevel(candidate.experience.map((e) => e.title));
  const cIdx = LEVEL_ORDER.indexOf(candidateLevel);
  const jIdx = LEVEL_ORDER.indexOf(jd.role_level.toLowerCase());
  let level_score: number;
  if (cIdx === jIdx) {
    level_score = 1;
  } else {
    const diff = Math.abs(cIdx - jIdx);
    level_score = Math.max(0, 1 - diff * 0.25);
  }

  const overall_score = Math.round((skill_score * 0.6 + experience_score * 0.3 + level_score * 0.1) * 100);

  const matched_required_skills = jd.required_skills.filter((s) => cSkills.includes(s));
  const matched_preferred_skills = jd.preferred_skills.filter((s) => cSkills.includes(s));
  const missing_required_skills = jd.required_skills.filter((s) => !cSkills.includes(s));

  return {
    overall_score,
    skill_score: Math.round(skill_score * 100),
    experience_score: Math.round(experience_score * 100),
    level_score: Math.round(level_score * 100),
    matched_required_skills,
    matched_preferred_skills,
    missing_required_skills,
  };
}
