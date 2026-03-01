import mongoose from "mongoose";
import { Chat } from "../models/Chat.ts";
import { Message } from "../models/Message.ts";
import { AISession } from "../models/AISession.ts";
import { Resume } from "../models/Resume.ts";
import { Job } from "../models/Job.ts";
import { JobSeeker } from "../models/JobseekerProfile.ts";
import { User } from "../models/User.ts";
import { matchJobs } from "../services/jobMatcherService.js";
import { generateAssistantResponse } from "../services/aiService.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const QUERY_SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "node",
  "node.js",
  "express",
  "mongodb",
  "sql",
  "python",
  "java",
  "c++",
  "docker",
  "kubernetes",
  "aws",
  "html",
  "css",
  "tailwind",
  "next.js",
  "graphql",
];
const ROLE_HINTS = [
  "developer",
  "engineer",
  "designer",
  "manager",
  "analyst",
  "intern",
  "devops",
  "qa",
  "product manager",
  "data scientist",
];

const JOBSEEKER_CONFIRM_PATTERNS = [
  /\bi am (a )?(job ?seeker|fresher|candidate)\b/i,
  /\bi'?m (a )?(job ?seeker|fresher|candidate)\b/i,
  /\blooking for (a )?job\b/i,
  /\bsearching for (a )?job\b/i,
  /\byes[, ]*(i am|i'm).*(job ?seeker|candidate)\b/i,
];

const EMPLOYER_CONFIRM_PATTERNS = [
  /\bi am (an )?(employer|recruiter|hiring manager)\b/i,
  /\bi'?m (an )?(employer|recruiter|hiring manager)\b/i,
  /\bwe are hiring\b/i,
  /\blooking to hire\b/i,
];

const extractQuerySignals = (content) => {
  const text = String(content || "").toLowerCase();
  
  let skills = [];
  
  const skillsMatch = content.match(/(?:skills?|extracted\s*skills?)[:\s]+([^.]+)/i);
  if (skillsMatch && skillsMatch[1]) {
    const mentionedSkills = skillsMatch[1]
      .split(/[,;|]/)
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 1);
    
    skills = mentionedSkills.filter(skill => 
      QUERY_SKILL_KEYWORDS.some(ks => skill.includes(ks) || ks.includes(skill))
    );
  }
  
  if (skills.length === 0) {
    skills = QUERY_SKILL_KEYWORDS.filter((skill) => text.includes(skill));
  }
  
  const role = ROLE_HINTS.find((hint) => text.includes(hint)) || "";

  const locationMatch =
    text.match(/\bin\s+([a-z\s]{2,40})/) ||
    text.match(/\bfor\s+([a-z\s]{2,40})\s+location/);
  const location = locationMatch?.[1]?.trim() || "";

  return {
    skills: Array.from(new Set(skills)),
    role,
    location,
  };
};

const detectUserRoleFromHistory = (chatHistory) => {
  const userOnly = (chatHistory || []).filter((item) => item?.sender === "user");
  let isJobseeker = false;
  let isEmployer = false;

  for (const item of userOnly) {
    const text = String(item?.content || "");
    if (!isJobseeker && JOBSEEKER_CONFIRM_PATTERNS.some((pattern) => pattern.test(text))) {
      isJobseeker = true;
    }
    if (!isEmployer && EMPLOYER_CONFIRM_PATTERNS.some((pattern) => pattern.test(text))) {
      isEmployer = true;
    }
  }

  if (isJobseeker && !isEmployer) return "jobseeker";
  if (isEmployer && !isJobseeker) return "employer";
  return "unknown";
};

// Helper to get role from User model
const getUserRole = async (userId) => {
  if (!userId || !isValidObjectId(userId)) {
    return null;
  }
  
  try {
    const user = await User.findById(userId).select("role").lean();
    if (user && user.role) {
      if (user.role === "employer") {
        return "employer";
      } else if (user.role === "job_seeker") {
        return "jobseeker";
      }
      return "jobseeker"; // Default
    }
  } catch (err) {
    console.error("[getUserRole] Error:", err);
  }
  return null;
};

export const createChat = async (req, res) => {
  try {
    const { userId, guestId, title = "New Chat", type = "general" } = req.body || {};
    const hasUser = userId && isValidObjectId(userId);
    const hasGuest = String(guestId || "").trim().length > 0;

    if (!hasUser && !hasGuest) {
      return res.status(400).json({ error: "userId or guestId is required" });
    }

    // Get user's role if logged in
    const detectedRole = hasUser ? await getUserRole(userId) : null;
    console.log("[createChat] userId:", userId, "detectedRole:", detectedRole);

    const chat = await Chat.create({
      user: hasUser ? userId : undefined,
      guestId: hasGuest ? String(guestId).trim() : undefined,
      title,
      type,
      lastMessageAt: new Date(),
    });

    return res.status(201).json({ 
      chat,
      detectedRole: detectedRole || "unknown"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to create chat" });
  }
};

export const getChatsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    const chats = await Chat.find({ user: userId }).sort({ lastMessageAt: -1, updatedAt: -1 });
    return res.status(200).json({ chats });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch chats" });
  }
};

export const getMessagesByChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId, guestId } = req.query;

    if (!chatId || !isValidObjectId(chatId)) {
      return res.status(400).json({ error: "Valid chatId is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (userId) {
      if (!chat.user || String(chat.user) !== String(userId)) {
        return res.status(403).json({ error: "Unauthorized for this chat" });
      }
    }
    if (!userId && guestId) {
      if (!chat.guestId || String(chat.guestId) !== String(guestId)) {
        return res.status(403).json({ error: "Unauthorized for this chat" });
      }
    }

    // Get user role if logged in
    const detectedRole = userId && isValidObjectId(userId) ? await getUserRole(userId) : null;

    const messages = await Message.find({ chat: chatId })
      .populate("suggestedJobs")
      .sort({ createdAt: 1 });

    return res.status(200).json({ 
      chat, 
      messages,
      detectedRole: detectedRole || "unknown"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  const startTime = Date.now();
  try {
    const { chatId } = req.params;
    const { userId, guestId, content } = req.body || {};
    const normalizedGuestId = String(guestId || "").trim();
    const hasUser = userId && isValidObjectId(userId);
    const hasGuest = normalizedGuestId.length > 0;

    if (!chatId || !isValidObjectId(chatId)) {
      return res.status(400).json({ error: "Valid chatId is required" });
    }
    if (!hasUser && !hasGuest) {
      return res.status(400).json({ error: "userId or guestId is required" });
    }
    if (!String(content || "").trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    if (hasUser) {
      if (!chat.user || String(chat.user) !== String(userId)) {
        return res.status(403).json({ error: "Unauthorized for this chat" });
      }
    } else if (hasGuest) {
      if (!chat.guestId || String(chat.guestId) !== normalizedGuestId) {
        return res.status(403).json({ error: "Unauthorized for this chat" });
      }
    }

    const userMessage = await Message.create({
      chat: chatId,
      sender: "user",
      content: String(content).trim(),
    });

    const recentHistory = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(16)
      .lean();
    const chatHistory = recentHistory
      .reverse()
      .map((item) => ({
        sender: item.sender,
        content: item.content,
      }))
      .filter((item) => item && item.content);

    // Get user info to determine role
    let userRole = null;
    if (hasUser) {
      userRole = await getUserRole(userId);
    }

    const [profile, resume, jobs] = await Promise.all([
      hasUser ? JobSeeker.findOne({ user: userId }) : Promise.resolve(null),
      hasUser
        ? Resume.findOne({ user: userId, isActive: true }).sort({ updatedAt: -1 })
        : Promise.resolve(null),
      Job.find({}).sort({ postedDate: -1 }).limit(100),
    ]);

    const querySignals = extractQuerySignals(content);
    const hasProfileSignals =
      Array.isArray(profile?.skills) && profile.skills.length > 0;
    const hasResumeSignals =
      Array.isArray(resume?.extractedSkills) && resume.extractedSkills.length > 0;
    const hasMessageSkills = Array.isArray(querySignals.skills) && querySignals.skills.length > 0;
    
    const explicitlyAskedForJobs = 
      /\b(job|jobs|employment|work|vacancy|opening|position|hiring)\b/i.test(content) ||
      /\b(find|search|look(ing)? for|get|show|need)\b.*\b(job|jobs|work)\b/i.test(content);

    const isGuest = !hasUser;
    
    let shouldSuggestJobs = false;
    
    if (isGuest) {
      shouldSuggestJobs = hasMessageSkills && explicitlyAskedForJobs;
    } else {
      shouldSuggestJobs = hasProfileSignals || hasResumeSignals || explicitlyAskedForJobs;
    }

    const effectiveProfile = shouldSuggestJobs
      ? {
          ...(profile || {}),
          skills: Array.from(
            new Set([...(profile?.skills || []), ...querySignals.skills])
          ),
          jobPreferences: {
            ...(profile?.jobPreferences || {}),
            preferredRole:
              profile?.jobPreferences?.preferredRole || querySignals.role || "",
            preferredLocation:
              profile?.jobPreferences?.preferredLocation || querySignals.location || "",
          },
        }
      : profile;

    const matches = shouldSuggestJobs
      ? matchJobs({
          jobs,
          profile: effectiveProfile,
          resume,
          topN: 5,
        })
      : [];

    const aiResult = await generateAssistantResponse({
      userMessage: content,
      matches,
      profile,
      resume,
      chatHistory,
    });

    // Use user role from User model if available, otherwise detect from chat history
    let role = userRole || detectUserRoleFromHistory(chatHistory);
    
    const hasResumeText = Boolean(String(resume?.extractedText || "").trim());
    const hasResumeSkills = Array.isArray(resume?.extractedSkills) && resume.extractedSkills.length > 0;
    const requestResumeUpload = role === "jobseeker" && !hasResumeText && !hasResumeSkills;

    const aiMessage = await Message.create({
      chat: chatId,
      sender: "ai",
      content:
        aiResult.source === "groq"
          ? aiResult.responseText
          : `[AI Fallback Mode]\n${aiResult.responseText}`,
      suggestedJobs: matches.map((item) => item.job?._id).filter(Boolean),
      metadata: {
        tokensUsed: aiResult.tokensUsed,
        responseTime: Date.now() - startTime,
        source: aiResult.source,
        providerError: aiResult.providerError || null,
      },
    });

    if (hasUser) {
      await AISession.findOneAndUpdate(
        { user: userId, chat: chatId },
        {
          user: userId,
          chat: chatId,
          lastExtractedSkills: Array.from(
            new Set([...(profile?.skills || []), ...(resume?.extractedSkills || [])])
          ),
          lastSuggestedJobs: matches.map((item) => item.job?._id).filter(Boolean),
          conversationState: aiResult.state,
        },
        { upsert: true, new: true }
      );
    }

    chat.lastMessageAt = new Date();
    await chat.save();

    const suggestedJobs = matches.map((item) => ({
      score: item.score,
      matchedSkills: item.matchedSkills,
      reasons: item.reasons,
      job: item.job,
    }));

    return res.status(200).json({
      userMessage,
      aiMessage,
      suggestedJobs,
      aiSource: aiResult.source || "unknown",
      aiProviderError: aiResult.providerError || null,
      requestResumeUpload,
      detectedRole: role || "unknown",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to process chat message" });
  }
};
