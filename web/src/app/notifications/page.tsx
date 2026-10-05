"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/api/client";
import { Bell, CheckCheck, Clock, Loader2 } from "lucide-react";

interface AppNotification {
  id: string | number;
  title: string;
  body: string;
  created_at: string;
  read_at?: string;
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications");
      const data = res.data?.data;
      if (Array.isArray(data)) return data as AppNotification[];
      if (Array.isArray(data?.data)) return data.data as AppNotification[];
      return [];
    },
  });

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post("/notifications/read-all");
      refetch();
    } catch {
      refetch();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Badge variant="primary" size="sm" className="mb-1">
            Notifications Center
          </Badge>
          <h1 className="text-2xl font-extrabold text-slate-900">Notification Inbox</h1>
          <p className="text-xs text-slate-500">
            In-app alerts for application status updates and job matches.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          leftIcon={<CheckCheck className="h-4 w-4" />}
        >
          Mark All as Read
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#174A7E]" />
          <span className="text-sm font-semibold">Loading notification inbox...</span>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 border-slate-200 space-y-1 transition-all ${
                !n.read_at ? "bg-sky-50/60 border-sky-200" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {n.created_at}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 space-y-3 border-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Bell className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Your notification inbox is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You will receive updates here whenever an employer reviews or shortlists your application.
          </p>
        </Card>
      )}
    </div>
  );
}
