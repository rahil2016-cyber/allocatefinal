"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import apiClient from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { formatSalary } from "@/lib/utils";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  Briefcase,
  MapPin,
  ExternalLink,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

interface AiChatJob {
  id: string | number;
  title: string;
  company_name?: string;
  company?: { name?: string };
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  location?: string;
  city?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  jobs?: AiChatJob[];
  timestamp: string;
}

const DEFAULT_SUGGESTIONS = [
  "Find jobs matching my profile",
  "Show jobs near me",
  "Show my applications",
  "What should I prepare for my interview?",
  "How does JobAllocate work?",
];

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: number | string | null;
  jobTitle?: string | null;
}

export function AiChatModal({ isOpen, onClose, jobId, jobTitle }: AiChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore conversation ID from storage on mount
  useEffect(() => {
    if (!isOpen) return;

    const savedConvId = localStorage.getItem("joballocate_ai_conversation_id");
    if (savedConvId) {
      setConversationId(savedConvId);
      // Fetch conversation history from server
      apiClient
        .get(`/ai/conversations/${savedConvId}`)
        .then((res) => {
          const data = res.data?.data || res.data;
          if (data?.messages && Array.isArray(data.messages)) {
            const formatted = data.messages.map((m: any, idx: number) => ({
              id: `${idx}`,
              sender: m.role === "user" ? "user" : "assistant",
              text: m.text || m.content || "",
              jobs: m.jobs || [],
              timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
            }));
            setMessages(formatted);
          }
        })
        .catch(() => {
          // If conversation expired or not found, start fresh
          localStorage.removeItem("joballocate_ai_conversation_id");
          setConversationId(null);
          initWelcomeMessage();
        });
    } else {
      initWelcomeMessage();
    }
  }, [isOpen, jobId, jobTitle]);

  const initWelcomeMessage = () => {
    const welcomeText = jobTitle
      ? `Hello! I see you are looking at "${jobTitle}". How can I help you understand this role or prepare your application?`
      : "Hello! I am your JobAllocate AI Career Coach. How can I help you with your job search, resume improvement, or interview preparation today?";

    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: welcomeText,
        timestamp: "Just now",
      },
    ]);
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleStartNewChat = () => {
    localStorage.removeItem("joballocate_ai_conversation_id");
    setConversationId(null);
    initWelcomeMessage();
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isLoading) return;

    if (!user) {
      setError("Please sign in to chat with the AI Career Coach.");
      return;
    }

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        message: prompt,
        conversation_id: conversationId || undefined,
      };
      if (jobId) {
        payload.job_id = Number(jobId);
      }

      const res = await apiClient.post("/ai/chat", payload);
      const data = res.data?.data || res.data;

      const newConvId = data?.conversation_id || conversationId;
      if (newConvId) {
        setConversationId(newConvId);
        localStorage.setItem("joballocate_ai_conversation_id", newConvId);
      }

      const botReply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "assistant",
        text:
          data?.message ||
          data?.response ||
          "I have analyzed your request. Here are personalized recommendations for your career journey.",
        jobs: Array.isArray(data?.jobs) ? data.jobs : [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Sorry, I'm having trouble connecting right now. Please try again.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "assistant",
          text: "I am currently unable to fetch live recommendations, but you can highlight your skills, projects, and recent achievements on JobAllocate.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn">
      {/* Chat Container */}
      <div className="bg-white w-full sm:max-w-md h-[90vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#174A7E] to-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                JobAllocate AI Coach
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              </h3>
              <p className="text-[11px] text-sky-200 font-medium">
                {jobTitle ? `Focused on: ${jobTitle}` : "Career & Job Search Assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleStartNewChat}
              title="Reset conversation"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 custom-scrollbar">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-xs ${
                    isUser ? "bg-slate-900" : "bg-[#174A7E]"
                  }`}
                >
                  {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`space-y-2 max-w-[82%]`}>
                  <div
                    className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? "bg-[#174A7E] text-white rounded-tr-xs"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span
                      className={`block text-[10px] mt-1.5 font-medium ${
                        isUser ? "text-sky-200 text-right" : "text-slate-400"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {/* Render Job Recommendations if returned by AI */}
                  {m.jobs && m.jobs.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                        Recommended Jobs:
                      </span>
                      {m.jobs.map((job) => {
                        const cName = job.company?.name || job.company_name || "Hiring Partner";
                        const loc = job.location || job.city || "India";
                        return (
                          <div
                            key={job.id}
                            className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs hover:border-[#174A7E] transition-all space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                                {job.title}
                              </h5>
                              <Link
                                href={`/jobs/${job.id}`}
                                onClick={onClose}
                                className="text-[#174A7E] hover:underline shrink-0 text-xs font-bold flex items-center gap-0.5"
                              >
                                View <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>{cName}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" /> {loc}
                              </span>
                            </p>
                            {job.salary_min && (
                              <p className="text-[11px] font-extrabold text-[#174A7E]">
                                {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center">
              <div className="h-8 w-8 rounded-xl bg-[#174A7E] text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#174A7E]" />
                <span className="font-semibold">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pill Carousel */}
        {messages.length <= 3 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
            {DEFAULT_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSend(sug)}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 pb-safe"
        >
          <input
            type="text"
            placeholder={user ? "Ask JobAllocate AI Coach..." : "Sign in to chat..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading || !user}
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20 focus:border-[#174A7E] disabled:bg-slate-50 disabled:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || !user}
            className="h-10 w-10 rounded-xl bg-[#174A7E] hover:bg-[#123860] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
            aria-label="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
