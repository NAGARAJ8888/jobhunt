/**
 * AI-Powered Resume Parser using Groq LLM
 * This provides much more accurate skill extraction than keyword matching
 */

async function callGroqAPI(prompt, systemPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  const apiUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Groq API request failed");
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

const RESUME_PARSE_SYSTEM_PROMPT = `You are an expert resume parser. Extract ALL skills mentioned in the resume. Return ONLY valid JSON.`;

const RESUME_PARSE_USER_PROMPT = `Extract all technical skills, tools, frameworks, and languages from this resume. 

Resume:
---
{resumeText}
---

Return JSON with keys: skills (array), experienceYears (number or null), jobTitles (array), companies (array), education (array), certifications (array). Return ONLY JSON.`;

export async function parseResumeWithAI(resumeText) {
  if (!resumeText || !resumeText.trim()) {
    return {
      skills: [],
      softSkills: [],
      experienceYears: null,
      jobTitles: [],
      companies: [],
      education: [],
      languages: [],
      certifications: [],
      parsedBy: "ai",
    };
  }

  const truncatedText = resumeText.slice(0, 10000);
  const userPrompt = RESUME_PARSE_USER_PROMPT.replace("{resumeText}", truncatedText);

  try {
    const result = await callGroqAPI(userPrompt, RESUME_PARSE_SYSTEM_PROMPT);
    
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return parseResumeWithRegex(resumeText);
    }

    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
      experienceYears: typeof parsed.experienceYears === "number" ? parsed.experienceYears : null,
      jobTitles: Array.isArray(parsed.jobTitles) ? parsed.jobTitles : [],
      companies: Array.isArray(parsed.companies) ? parsed.companies : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      parsedBy: "ai",
    };
  } catch (error) {
    console.error("AI resume parsing failed:", error);
    return parseResumeWithRegex(resumeText);
  }
}

function parseResumeWithRegex(text) {
  const skillPatterns = [
    /javascript|typescript|python|java|c\+\+|c#|go|golang|rust|ruby|php|swift|kotlin|scala|perl|matlab|dart|elixir|erlang|haskell|lua|julia/gi,
    /react|vue|angular|next\.js|svelte|jquery|bootstrap|tailwind|material-ui|redux|vuex|zustand/gi,
    /nodejs|express|flask|django|spring|rails|laravel|asp\.net|\.net|nestjs|fastapi|koa/gi,
    /mysql|postgresql|mongodb|redis|elasticsearch|cassandra|dynamodb|firebase|sql|sqlite|oracle|supabase|prisma|mongoose/gi,
    /aws|azure|gcp|docker|kubernetes|jenkins|terraform|ansible|github|gitlab/gi,
    /tensorflow|pytorch|keras|scikit-learn|pandas|numpy|spark|hadoop|kafka|tableau/gi,
    /react native|flutter|ionic|xamarin|android|ios/gi,
    /git|webpack|vite|eslint|prettier|npm|yarn|jira|confluence|figma/gi,
    /jest|mocha|cypress|playwright|selenium|pytest|junit/gi,
    /agile|scrum|kanban|ci\/cd|devops|graphql|rest/gi,
    /machine learning|deep learning|artificial intelligence|ml|ai|nlp/gi,
    /linux|unix|windows|macos/gi,
  ];

  const foundSkills = new Set();
  for (const pattern of skillPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => foundSkills.add(m.toLowerCase()));
    }
  }

  const expMatch = text.match(/(\d+)\+?\s*(years|yrs|year)/i);
  const experienceYears = expMatch ? parseInt(expMatch[1]) : null;

  return {
    skills: Array.from(foundSkills),
    softSkills: [],
    experienceYears: experienceYears,
    jobTitles: [],
    companies: [],
    education: [],
    languages: [],
    certifications: [],
    parsedBy: "regex",
  };
}

export default parseResumeWithAI;
