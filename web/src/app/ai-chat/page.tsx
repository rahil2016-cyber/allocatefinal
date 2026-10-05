"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { Bot, Send, User as UserIcon, Sparkles, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your JobAllocate AI Career Assistant. How can I assist you with your job search, resume improvement, or interview preparation today?",
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: inputText,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentPrompt = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      const response = await apiClient.post("/ai/chat", { message: currentPrompt });
      const reply =
        response.data?.data?.response ||
        response.data?.response ||
        "I recommend highlighting your relevant project experience, tailoring your resume skills to match key requirements, and practicing common technical interview questions.";

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: reply,
          timestamp: "Just now",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: "I recommend highlighting your relevant project experience, tailoring your resume skills to match key job requirements, and highlighting quantifiable achievements.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <Badge variant="primary" size="sm" className="mb-1">
          <Sparkles className="h-3 w-3 mr-1 text-sky-400" /> AI Career Assistant
        </Badge>
        <h1 className="text-2xl font-extrabold text-slate-900">JobAllocate AI Coach</h1>
        <p className="text-xs text-slate-500">
          Ask questions regarding interview strategies, resume bullet points, or salary negotiations.
        </p>
      </div>

      <Card className="p-0 border-slate-200 overflow-hidden flex flex-col h-[550px]">
        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold text-xs shrink-0 ${
                  m.sender === "user" ? "bg-slate-900" : "bg-[#174A7E]"
                }`}
              >
                {m.sender === "user" ? <UserIcon className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              <div
                className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#174A7E] text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#174A7E]" />
              <span>AI Coach is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            placeholder="Ask AI coach for advice..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#174A7E]/20"
          />
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} rightIcon={<Send className="h-4 w-4" />}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
