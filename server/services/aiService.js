import { summarizeMatchInsights } from "./jobMatcherService.js";

function toText(value) {
  return String(value || "").trim();
}

// Extract questions that have been answered in the conversation
// This helps avoid asking the same question again
function extractAnsweredQuestions(chatHistory = []) {
  const answeredQuestions = [];
  const questionPatterns = [
    /are you (a |an )?(job ?seeker|employer|recruiter|hiring manager)/i,
    /(job ?seeker|employer|recruiter|hiring manager)/i,
    /(?:looking for|searching for)/i,
    /(?:hire|hiring)/i,
  ];

  // Only look at the most recent exchanges to find role-related answers
  const recentHistory = chatHistory.slice(-6);

  for (let i = 0; i < recentHistory.length; i++) {
    const msg = recentHistory[i];
    // If AI asked a question
    if (msg.sender === "ai") {
      const content = msg.content || "";
      // Check if the next user message answers it
      if (i + 1 < recentHistory.length) {
        const nextMsg = recentHistory[i + 1];
        if (nextMsg.sender === "user") {
          const userAnswer = nextMsg.content || "";
          // If user answer contains role indicators, store it as answered
          for (const pattern of questionPatterns) {
            if (pattern.test(userAnswer)) {
              // Extract the question from AI message (first sentence usually)
              const questionMatch = content.match(/[^.!?]*[?]/);
              if (questionMatch) {
                answeredQuestions.push(questionMatch[0].trim());
              }
              break;
            }
          }
        }
      }
    }
  }

  return answeredQuestions;
}

export function detectConversationState(message) {
  const text = toText(message).toLowerCase();
  if (text.includes("resume")) return "improving_resume";
  if (text.includes("job") || text.includes("match")) return "suggesting_jobs";
  if (text.includes("interview")) return "interview_prep";
  return "general";
}

function buildContextPayload({ profile, resume, matches }) {
  const topMatches = (matches || []).slice(0, 5).map((item) => ({
    title: item?.job?.title || "",
    company: item?.job?.company || "",
    location: item?.job?.location || "",
    type: item?.job?.type || "",
    salary: item?.job?.salary || "",
    score: item?.score ?? 0,
    matchedSkills: item?.matchedSkills || [],
    reasons: item?.reasons || [],
  }));

  return {
    profile: {
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      skills: Array.isArray(profile?.skills) ? profile.skills : [],
      preferredRole: profile?.jobPreferences?.preferredRole || "",
      preferredLocation: profile?.jobPreferences?.preferredLocation || "",
      jobType: profile?.jobPreferences?.jobType || "",
      availability: profile?.jobPreferences?.availability || "",
    },
    resume: {
      extractedSkills: Array.isArray(resume?.extractedSkills) ? resume.extractedSkills : [],
      experienceYears: resume?.experienceYears || null,
      education: Array.isArray(resume?.education) ? resume.education : [],
    },
    topMatches,
  };
}

async function generateGroqResponse({
  userMessage,
  profile,
  resume,
  matches,
  state,
  chatHistory = [],
  fallbackText,
}) {
  const apiKey = process.env.GROQ_API_KEY;
  const apiUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  const requireLive = String(process.env.AI_REQUIRE_LIVE || "false").toLowerCase() === "true";
  if (!apiKey || !apiUrl) {
    if (requireLive) {
      throw new Error("GROQ_API_KEY or GROQ_API_URL is missing and AI_REQUIRE_LIVE=true");
    }
    return {
      responseText: fallbackText,
      tokensUsed: Math.ceil(fallbackText.length / 4),
      source: "fallback_missing_key",
    };
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const contextJson = JSON.stringify(buildContextPayload({ profile, resume, matches }));

  // Extract answered questions from chat history to avoid repeating them
  const answeredQuestions = extractAnsweredQuestions(chatHistory);
  const answeredQuestionsContext = answeredQuestions.length > 0 
    ? `\nAlready answered questions (DO NOT ask these again):\n${answeredQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
    : "";

  const systemPrompt = `
You are an AI Assistant inside a job portal.

IMPORTANT:
Before suggesting jobs or building profiles, identify whether the user is:
- A Job Seeker  
- An Employer

Conversation Rules:
1. If user role is unknown, ask: "Are you looking for a job or hiring candidates?"
2. Do NOT assume user is a job seeker.

3. JOB SEEKER without profile/resume context:
   - Do NOT ask them to paste resume details manually.
   - Instead, guide them to: "Sign up or log in to access personalized job matching. Once logged in, you can use the job search page with filters (location, job type, salary) to find relevant jobs."
   - Remind them they can upload their resume in their profile after logging in.

4. EMPLOYER without profile:
   - Guide them to: "Sign up or log in to post jobs and access candidate search."

5. Do not assume any specific UI buttons or controls exist.
6. Once role is identified:
   - Job Seeker: help with jobs, resume, interview prep.
   - Employer: help with hiring and candidate evaluation.
7. Keep responses short (2-3 lines max), ask one clear follow-up question.
8. Stay strictly job-portal related.
9. NEVER ask a question that has already been answered in this conversation. Check the chat history and answered questions list.
10. If user confirms their role (jobseeker/employer), acknowledge and remember it for the rest of the conversation.

Current conversation state:
${state}
${answeredQuestionsContext}
`;

  const userPrompt = `
User message:
${userMessage}

Recent chat history:
${JSON.stringify(
  (chatHistory || []).map((msg) => ({
    role: msg.sender === "ai" ? "assistant" : "user",
    content: msg.content,
  }))
)}

Context (JSON):
${contextJson}

Return a helpful response in plain text with:
- short direct answer
- bullet list of reasoning or fit
- next actions

IMPORTANT: Do NOT ask the same question again if the user has already answered it in the conversation history.
`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: userPrompt.trim() },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Groq request failed");
  }

  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned empty response");
  }

  return {
    responseText: text,
    tokensUsed: Number(data?.usage?.total_tokens || Math.ceil(text.length / 4)),
    source: "groq",
  };
}

export async function generateAssistantResponse({
  userMessage,
  matches = [],
  profile = null,
  resume = null,
  chatHistory = [],
}) {
  const state = detectConversationState(userMessage);
  const profileSkills = Array.isArray(profile?.skills) ? profile.skills : [];
  const resumeSkills = Array.isArray(resume?.extractedSkills) ? resume.extractedSkills : [];
  const knownSkills = Array.from(new Set([...profileSkills, ...resumeSkills])).slice(0, 10);

  const intro =
    state === "suggesting_jobs"
      ? "I reviewed your profile and looked for suitable jobs."
      : state === "improving_resume"
        ? "I reviewed your current resume context."
        : "I can help with career guidance, job matching, and resume feedback.";

  const matchSummary = summarizeMatchInsights(matches);
  const skillsSummary =
    knownSkills.length > 0
      ? `Key skills detected: ${knownSkills.join(", ")}.`
      : "I could not detect strong skills yet. Add skills in profile/resume for better matching.";

  const nextSteps = [];
  if (state === "suggesting_jobs") {
    nextSteps.push("Ask me to explain why each suggested job is a fit.");
    nextSteps.push("Ask me to filter suggestions by location, role, or job type.");
  } else if (state === "improving_resume") {
    nextSteps.push("Ask me to draft a stronger resume summary.");
    nextSteps.push("Ask me to improve bullets for your recent experience.");
  } else {
    nextSteps.push("Ask me to suggest matching jobs.");
    nextSteps.push("Ask me to review your resume.");
  }

  const responseText = [
    intro,
    matchSummary,
    skillsSummary,
    "Next steps:",
    ...nextSteps.map((step, index) => `${index + 1}. ${step}`),
  ].join("\n");

  const tokensUsed = Math.ceil(responseText.length / 4);
  const fallback = { state, responseText, tokensUsed };

  try {
    const llm = await generateGroqResponse({
      userMessage,
      profile,
      resume,
      matches,
      state,
      chatHistory,
      fallbackText: responseText,
    });

    return {
      state,
      responseText: llm.responseText,
      tokensUsed: llm.tokensUsed,
      source: llm.source,
      providerError: null,
    };
  } catch (error) {
    const requireLive = String(process.env.AI_REQUIRE_LIVE || "false").toLowerCase() === "true";
    if (requireLive) {
      throw error;
    }
    return {
      ...fallback,
      source: "fallback",
      providerError: String(error?.message || "Unknown provider error"),
    };
  }
}
