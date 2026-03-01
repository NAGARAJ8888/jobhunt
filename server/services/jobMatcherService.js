const DEFAULT_TOP_N = 5;

const STOP_WORDS = new Set([
  "and", "or", "with", "for", "the", "to", "of", "in", "on", "at", "a", "an",
  "job", "work", "experience", "years", "year", "plus", "required", "must",
  "preferred", "nice", "have", "has", "ability", "skills", "knowledge"
]);

// Synonym mapping for common skill variations
const SKILL_SYNONYMS = {
  "react": ["react.js", "reactjs", "reactjs", "react native"],
  "node": ["node.js", "nodejs"],
  "javascript": ["js"],
  "typescript": ["ts"],
  "python": ["py", "python3"],
  "java": ["javase", "javaee"],
  "aws": ["amazon web services", "amazon aws"],
  "azure": ["microsoft azure"],
  "gcp": ["google cloud", "google cloud platform"],
  "postgresql": ["postgres"],
  "mongodb": ["mongo"],
  "docker": ["docker-compose", "dockerfile"],
  "kubernetes": ["k8s", "kubes"],
  "sql": ["sql server", "mysql", "postgresql", "oracle sql"],
  "rest": ["rest api", "restful api", "restful"],
  "graphql": ["gql"],
  "machine learning": ["ml", "deep learning"],
  "data science": ["data analyst", "data analytics"],
  "devops": ["sre", "site reliability"],
  "agile": ["scrum", "kanban"],
};

function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\- ]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && !STOP_WORDS.has(token));
}

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return Array.from(new Set(skills.map((skill) => String(skill).toLowerCase().trim()).filter(Boolean)));
}

// Expand a skill to include its synonyms
function expandSkillWithSynonyms(skill) {
  const normalized = skill.toLowerCase().trim();
  const expanded = new Set([normalized]);
  
  // Check if this skill is a key in synonyms
  if (SKILL_SYNONYMS[normalized]) {
    SKILL_SYNONYMS[normalized].forEach(syn => expanded.add(syn));
  }
  
  // Check if this skill is a synonym of another key
  for (const [key, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    if (synonyms.includes(normalized)) {
      expanded.add(key);
      synonyms.forEach(s => expanded.add(s));
    }
  }
  
  return expanded;
}

function deriveCandidateSkills({ profile, resume }) {
  const profileSkills = normalizeSkills(profile?.skills || []);
  const resumeSkills = normalizeSkills(resume?.extractedSkills || []);
  return Array.from(new Set([...profileSkills, ...resumeSkills]));
}

function scoreJob(job, candidateSkills, preferredLocation) {
  const tags = normalizeSkills(job?.tags || []);
  const requirementsTokens = tokenize((job?.requirements || []).join(" "));
  const descriptionTokens = tokenize(job?.description || "");
  const allJobTokens = new Set([...tags, ...requirementsTokens, ...descriptionTokens]);

  // Find matched skills with expanded synonyms
  const matchedSkills = [];
  const partialMatches = [];
  
  for (const skill of candidateSkills) {
    const skillExpanded = expandSkillWithSynonyms(skill);
    let found = false;
    
    for (const expSkill of skillExpanded) {
      if (allJobTokens.has(expSkill)) {
        matchedSkills.push(skill);
        found = true;
        break;
      }
    }
    
    // Check for partial matches (e.g., "react" in "react-native")
    if (!found) {
      for (const jobToken of allJobTokens) {
        for (const expSkill of skillExpanded) {
          if (jobToken.includes(expSkill) || expSkill.includes(jobToken)) {
            if (jobToken.length > 2 && expSkill.length > 2) {
              partialMatches.push(skill);
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
    }
  }

  const allMatchedSkills = [...matchedSkills, ...partialMatches];
  const unmatchedSkills = candidateSkills.filter(skill => !allMatchedSkills.includes(skill));

  // Calculate skill score - more realistic formula
  // Give partial credit for partial matches
  const matchWeight = matchedSkills.length * 1.0;
  const partialWeight = partialMatches.length * 0.5;
  const totalWeight = matchWeight + partialWeight;
  
  // If no candidate skills, default to null (no score)
  // If there are skills but none match, score is 0, not fake 20%
  const skillScore = candidateSkills.length > 0 
    ? Math.min(totalWeight / Math.max(candidateSkills.length, 1), 1)
    : 0;

  // Location matching
  const locationText = String(job?.location || "").toLowerCase();
  const preferredLocationText = String(preferredLocation || "").toLowerCase();
  
  let isLocationMatch = false;
  let isRemoteJob = locationText.includes("remote");
  
  if (!preferredLocationText) {
    // No preference - any location is fine, give partial credit
    isLocationMatch = true;
  } else if (isRemoteJob) {
    // Remote jobs match any location preference
    isLocationMatch = true;
  } else if (locationText.includes(preferredLocationText) || preferredLocationText.includes(locationText)) {
    isLocationMatch = true;
  }

  // Calculate final score
  // Skill score is weighted 80%, location 20%
  const locationScore = isLocationMatch ? 0.2 : 0;
  
  // If there are candidate skills but none match, score should be based only on location
  // If no skills at all, score should be 0 (no meaningful match)
  let baseScore;
  if (candidateSkills.length === 0) {
    // No skills in profile/resume - can't match
    baseScore = 0;
  } else if (allMatchedSkills.length === 0) {
    // Has skills but none match the job - give location credit only if location matches
    // Otherwise, very low score
    baseScore = isLocationMatch ? locationScore : 0.05;
  } else {
    // Has matching skills
    baseScore = 0.8 * skillScore + locationScore;
  }
  
  const score = Math.round(baseScore * 100);

  const reasons = [];
  if (allMatchedSkills.length > 0) {
    reasons.push(`Matched skills: ${allMatchedSkills.slice(0, 6).join(", ")}`);
  }
  if (isLocationMatch && preferredLocationText) {
    reasons.push(`Location: ${job.location}`);
  }
  if (unmatchedSkills.length > 0 && allMatchedSkills.length > 0) {
    reasons.push(`Other skills: ${unmatchedSkills.slice(0, 4).join(", ")}`);
  }
  if (candidateSkills.length === 0) {
    reasons.push("Add skills to your profile for better matching");
  }

  return {
    score,
    matchedSkills: allMatchedSkills,
    reasons,
  };
}

export function matchJobs({
  jobs,
  profile = null,
  resume = null,
  topN = DEFAULT_TOP_N,
}) {
  const candidateSkills = deriveCandidateSkills({ profile, resume });
  const preferredLocation = profile?.jobPreferences?.preferredLocation || "";

  const ranked = (jobs || [])
    .map((job) => {
      const result = scoreJob(job, candidateSkills, preferredLocation);
      return {
        job,
        score: result.score,
        matchedSkills: result.matchedSkills,
        reasons: result.reasons,
      };
    })
    // Filter out jobs with 0 or very low score if we have meaningful skills
    .filter((item) => {
      if (candidateSkills.length === 0) return true; // Keep all if no skills
      return item.score > 0; // Only keep jobs with some match
    })
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, topN);
}

export function summarizeMatchInsights(matches) {
  if (!Array.isArray(matches) || matches.length === 0) {
    return "No strong matches found yet. Add more skills in your profile or resume, or try a broader job search.";
  }

  const best = matches[0];
  if (best.score === 0) {
    return "No job matches found based on your current skills. Try adding more skills to your profile or expanding your search.";
  }
  
  return `Top match is "${best.job?.title || "a role"}" at "${best.job?.company || "a company"}" with a ${best.score}% fit. ${best.matchedSkills?.length ? `Matches: ${best.matchedSkills.join(", ")}` : ""}`;
}
