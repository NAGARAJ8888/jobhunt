// Comprehensive skill keywords with proper word boundaries
// Grouped by category for better organization
const SKILL_CATEGORIES = {
  // Programming Languages
  programming: [
    "javascript", "typescript", "python", "java", "csharp", "c++", "c", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "perl", "r", "matlab", "dart",
    "elixir", "erlang", "haskell", "lua", "julia"
  ],
  // Web Frameworks & Libraries
  frontend: [
    "react", "react.js", "reactjs", "vue", "vue.js", "vuejs", "angular", "angularjs",
    "next.js", "nextjs", "nuxt", "nuxt.js", "svelte", "jquery", "bootstrap", "tailwind",
    "tailwindcss", "material-ui", "mui", "chakra-ui", "redux", "zustand", "recoil"
  ],
  // Backend Frameworks
  backend: [
    "node.js", "nodejs", "express", "express.js", "fastapi", "flask", "django", "spring",
    "springboot", "rails", "ruby on rails", "laravel", "asp.net", ".net", "nestjs",
    "hapi", "koa", "echo", "gin"
  ],
  // Databases
  databases: [
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "firebase", "supabase", "prisma", "mongoose", "sqlite",
    "oracle", "mariadb", "couchdb", "neo4j", "influxdb"
  ],
  // Cloud & DevOps
  cloud: [
    "aws", "amazon web services", "azure", "gcp", "google cloud", "google cloud platform",
    "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins", "circleci",
    "github actions", "gitlab ci", "travis ci", "cloudformation", "pulumi"
  ],
  // Data & ML
  data: [
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "scipy", "spark", "hadoop", "hive", "kafka", "nifi", "tableau",
    "power bi", "data warehouse", "etl", "airflow"
  ],
  // Mobile
  mobile: [
    "react native", "flutter", "ionic", "xamarin", "android", "ios", "swiftui",
    "jetpack compose", "kotlin android"
  ],
  // Tools & Other
  tools: [
    "git", "github", "gitlab", "bitbucket", "svn", "jira", "confluence", "docker compose",
    "webpack", "vite", "esbuild", "babel", "eslint", "prettier", "npm", "yarn", "pnpm",
    "figma", "sketch", "adobe xd", "photoshop", "illustrator"
  ],
  // Testing
  testing: [
    "jest", "mocha", "cypress", "playwright", "selenium", "puppeteer", "pytest",
    "junit", "testng", "rspec", "minitest", "unittest"
  ],
  // Soft Skills & Methodologies
  soft: [
    "agile", "scrum", "kanban", "jira", "confluence", "rest api", "restful",
    "graphql", "grpc", "microservices", "ci/cd", "devops", "sre"
  ]
};

// Flatten all skills into a single array with variations
const ALL_SKILLS = [];
const SKILL_ALIASES = new Map();

// Add skills from all categories
for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
  for (const skill of skills) {
    // Add main skill
    if (!ALL_SKILLS.includes(skill)) {
      ALL_SKILLS.push(skill);
    }
    
    // Map common variations to canonical form
    if (skill === "react") {
      SKILL_ALIASES.set("react.js", "react");
      SKILL_ALIASES.set("reactjs", "react");
    } else if (skill === "node.js") {
      SKILL_ALIASES.set("nodejs", "node.js");
    } else if (skill === "typescript") {
      SKILL_ALIASES.set("ts", "typescript");
    } else if (skill === "javascript") {
      SKILL_ALIASES.set("js", "javascript");
    } else if (skill === "python") {
      SKILL_ALIASES.set("py", "python");
    } else if (skill === "aws") {
      SKILL_ALIASES.set("amazon web services", "aws");
    } else if (skill === "postgresql") {
      SKILL_ALIASES.set("postgres", "postgresql");
    } else if (skill === "docker") {
      SKILL_ALIASES.set("k8s", "kubernetes");
    }
  }
}

// Sort by length (longest first) to match more specific skills first
// This prevents "react" from matching before "react.js"
ALL_SKILLS.sort((a, b) => b.length - a.length);

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSkills(text) {
  const normalized = cleanText(text).toLowerCase();
  const foundSkills = new Set();
  
  // Create a regex pattern that matches skills as whole words (with word boundaries)
  // Sort skills by length descending to match more specific skills first
  const sortedSkills = [...ALL_SKILLS].sort((a, b) => b.length - a.length);
  
  for (const skill of sortedSkills) {
    // Skip very short skills (< 2 chars) to avoid false positives
    if (skill.length < 2) continue;
    
    // Create a word boundary pattern for each skill
    // This prevents "java" from matching in "javascript" or "javax"
    const escapedSkill = escapeRegex(skill);
    const pattern = new RegExp(`\\b${escapedSkill}(?:\\b|s|$|[-_])`, 'gi');
    
    if (pattern.test(normalized)) {
      // Get canonical skill name
      const canonicalSkill = SKILL_ALIASES.get(skill) || skill;
      foundSkills.add(canonicalSkill);
    }
  }
  
  // Additional checks for common problematic matches
  // Ensure "java" doesn't match in "javascript"
  if (foundSkills.has("javascript") && foundSkills.has("java")) {
    // Check if "java" appears as standalone - if not, remove it
    const javaPattern = /\bjava\b/i;
    if (!javaPattern.test(normalized)) {
      foundSkills.delete("java");
    }
  }
  
  // Ensure "c" doesn't match incorrectly
  if (foundSkills.has("c++") && foundSkills.has("c")) {
    foundSkills.delete("c");
  }
  
  return Array.from(foundSkills);
}

function extractExperienceYears(text) {
  const normalized = cleanText(text).toLowerCase();
  const patterns = [
    /(\d+)\+?\s*(years|yrs|year|yr)\s*(of\s*)?(experience|exp)/gi,
    /(\d+)\s*-\s*(\d+)\s*(years|yrs|year|yr)/gi,
    /experience[:\s]*(\d+)\+?\s*(years|yrs|year|yr)/gi,
  ];
  
  let maxYears = 0;
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(normalized)) !== null) {
      const years = Number(match[1] || match[2] || 0);
      if (years > maxYears && years <= 30) { // Reasonable cap
        maxYears = years;
      }
    }
  }
  return maxYears || null;
}

function extractEducation(text) {
  const normalized = cleanText(text);
  const lines = normalized.split(/[.;\n]/).map((line) => line.trim()).filter(Boolean);

  const education = [];
  const degreePatterns = [
    { regex: /ph\.?d\.?/i, degree: "Ph.D" },
    { regex: /master'?s?|m\.?sc\.?|m\.?tech|m\.?ba/i, degree: "Masters" },
    { regex: /b\.?tech|b\.?e\.?|b\.?sc\.?|b\.?a\.?/i, degree: "Bachelors" },
    { regex: /diploma/i, degree: "Diploma" },
    { regex: /high school|secondary|hscl/i, degree: "High School" },
  ];

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    // Skip lines that are too short or don't look like education
    if (line.length < 10) continue;
    
    for (const { regex, degree } of degreePatterns) {
      if (regex.test(lower)) {
        education.push({
          degree,
          field: line,
          institution: "",
        });
        break;
      }
    }

    if (education.length >= 3) break;
  }

  return education;
}

function extractTitle(text) {
  const normalized = cleanText(text);
  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Common job titles to look for
  const titlePatterns = [
    /(?:software|web|mobile|full.?stack|frontend|backend|devops|data|ml|ai|cloud)?\s*(?:engineer|developer|designer|manager|analyst|architect|lead|sr\.|senior|jr\.|junior|intern)/i,
    /(?:product|project|program)\s*(?:manager|owner)/i,
    /technical\s*(lead|director|head|manager)/i,
  ];
  
  for (const line of lines.slice(0, 10)) {
    for (const pattern of titlePatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
  }
  
  return null;
}

export function parseResumeText(text) {
  if (!text || typeof text !== 'string') {
    return {
      extractedText: "",
      extractedSkills: [],
      experienceYears: null,
      education: [],
      detectedTitle: null,
    };
  }
  
  const normalized = cleanText(text);
  
  return {
    extractedText: normalized,
    extractedSkills: extractSkills(normalized),
    experienceYears: extractExperienceYears(normalized),
    education: extractEducation(normalized),
    detectedTitle: extractTitle(normalized),
  };
}

export { SKILL_CATEGORIES, SKILL_ALIASES, ALL_SKILLS };
