"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Minimize2, SendHorizonal, X, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;
const GUEST_ID_STORAGE_KEY = "jobportal_ai_guest_id";

const toReadableError = (error: any) => {
  const message = String(error?.message || "");
  if (message.toLowerCase().includes("failed to fetch")) {
    return "Cannot connect to AI server. Please start backend server on port 5000 and try again.";
  }
  return message || "Something went wrong. Please try again.";
};

type MessageItem = {
  _id: string;
  sender: "user" | "ai";
  content: string;
};

type SuggestedJob = {
  score: number;
  matchedSkills?: string[];
  reasons?: string[];
  job: {
    _id?: string;
    id?: string;
    title?: string;
    company?: string;
    location?: string;
  };
};

// Keywords that indicate user wants job suggestions
const JOB_REQUEST_KEYWORDS = [
  "job", "jobs", "job search", "find job", "find jobs", "looking for job",
  "search job", "hire", "vacancy", "position", "opportunity", "apply",
  "suggest jobs", "matching jobs", "recommend jobs", "find me a job"
];

export function AIChatbot() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      _id: "welcome",
      sender: "ai",
      content:
        "Hi, I am your AI Job Assistant. Tell me whether you are a jobseeker or an employer, and I will help you find jobs or candidates.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [aiSource, setAiSource] = useState<"groq" | "fallback" | "fallback_missing_key" | "unknown">("unknown");
  const [aiProviderError, setAiProviderError] = useState("");
  const [suggestedJobs, setSuggestedJobs] = useState<SuggestedJob[]>([]);
  const [guestId, setGuestId] = useState("");
  const [detectedRole, setDetectedRole] = useState<"jobseeker" | "employer" | "unknown">("unknown");
  const [chatCreated, setChatCreated] = useState(false);
  const [showJobs, setShowJobs] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(GUEST_ID_STORAGE_KEY);
    if (existing) {
      setGuestId(existing);
      return;
    }
    const created = `guest-${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_ID_STORAGE_KEY, created);
    setGuestId(created);
  }, []);

  // Set detected role from user object when logged in
  useEffect(() => {
    if (user?.role) {
      // Convert "job_seeker" to "jobseeker" to match backend format
      const role = user.role === "job_seeker" ? "jobseeker" : user.role;
      setDetectedRole(role);
    } else {
      setDetectedRole("unknown");
    }
    setChatId("");
    setChatCreated(false);
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, suggestedJobs, open]);

  const ensureChat = async () => {
    if (chatId && chatCreated) return chatId;
    
    const isLoggedIn = Boolean(user?.id);
    const resolvedGuestId = guestId || localStorage.getItem(GUEST_ID_STORAGE_KEY) || `guest-${Date.now()}`;
    
    if (!guestId && !isLoggedIn) {
      setGuestId(resolvedGuestId);
      localStorage.setItem(GUEST_ID_STORAGE_KEY, resolvedGuestId);
    }

    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: isLoggedIn ? user?.id : undefined,
        guestId: isLoggedIn ? undefined : resolvedGuestId,
        title: "AI Chatbot Session",
        type: "career",
      }),
    });
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok || !data?.chat?._id) {
      throw new Error(data?.error || "Failed to create chatbot session");
    }

    setChatId(data.chat._id);
    setChatCreated(true);
    
    if (data?.detectedRole && data.detectedRole !== "unknown") {
      setDetectedRole(data.detectedRole);
    }
    
    return data.chat._id as string;
  };

  const sendMessage = async (message?: string) => {
    const content = String(message ?? input).trim();
    if (!content) return;

    setSending(true);
    setError("");
    setInput("");

    const localId = `local-${Date.now()}`;
    setMessages((prev) => [...prev, { _id: localId, sender: "user", content }]);

    try {
      const currentChatId = await ensureChat();
      const isLoggedIn = Boolean(user?.id);
      
      const response = await fetch(`${API_BASE_URL}/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: isLoggedIn ? user?.id : undefined,
          guestId: isLoggedIn ? undefined : guestId,
          content,
        }),
      });
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data?.error || "Failed to send message");
      }

      setMessages((prev) => [
        ...prev.filter((item) => item._id !== localId),
        data.userMessage,
        data.aiMessage,
      ]);
      setAiSource((data?.aiSource as any) || "unknown");
      setAiProviderError(String(data?.aiProviderError || ""));
      setSuggestedJobs(Array.isArray(data?.suggestedJobs) ? data.suggestedJobs : []);
      
      // Check if user is requesting jobs
      const contentLower = content.toLowerCase();
      const wantsJobs = JOB_REQUEST_KEYWORDS.some(keyword => contentLower.includes(keyword));
      if (wantsJobs) {
        setShowJobs(true);
      }
      
      if (data?.detectedRole && data.detectedRole !== "unknown") {
        setDetectedRole(data.detectedRole);
      }
    } catch (e: any) {
      setMessages((prev) => prev.filter((item) => item._id !== localId));
      setError(toReadableError(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white shadow-xl hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">AI Chatbot</span>
        </button>
      )}

      {open && (
        <Card className="fixed bottom-5 right-5 z-50 w-[380px] max-w-[95vw] border shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">Smart AI Job Assistant</p>
                <p className="text-[11px] text-blue-100">AI-powered job matching</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setMinimized((prev) => !prev)}
                className="rounded p-1 hover:bg-white/15"
                aria-label="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 hover:bg-white/15"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <div className="flex h-[520px] flex-col">
              <div className="flex-1 overflow-auto px-3 py-3 space-y-2 bg-slate-50/40">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white border text-foreground"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              {error && (
                <div className="px-3 pb-1 text-xs text-red-600">{error}</div>
              )}

              <div className="border-t p-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={
                      user
                        ? "Ask for jobs, interview prep, career advice..."
                        : "Ask about jobs, job search tips..."
                    }
                    disabled={sending}
                  />
                  <Button onClick={() => sendMessage()} disabled={sending || !input.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground">AI:</span>
                  <Badge variant={aiSource === "groq" ? "secondary" : "outline"} className="text-[10px]">
                    {aiSource}
                  </Badge>
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="outline" className="text-[10px]">
                    {detectedRole}
                  </Badge>
                </div>
                {aiProviderError && (
                  <p className="mt-1 text-[11px] text-amber-700 line-clamp-2">
                    Provider error: {aiProviderError}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
