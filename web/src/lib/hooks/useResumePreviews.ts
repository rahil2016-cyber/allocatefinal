"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

/**
 * Fetches batch server-rendered HTML for all 13 resume templates in one single request.
 * Cached globally so all thumbnail cards across the app instantly share the real HTML.
 */
export function useResumeDemoPreviews(demoVariant: number = 0) {
  return useQuery<Record<string, string>>({
    queryKey: ["resumeDemoPreviewBatch", demoVariant],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/resume/demo-preview-html-batch?demo_variant=${demoVariant}`);
        return (res.data?.data?.previews as Record<string, string>) || {};
      } catch (e) {
        console.error("Failed to load resume demo batch HTML", e);
        return {};
      }
    },
    staleTime: 1000 * 60 * 60 * 2, // 2 hours cache
    gcTime: 1000 * 60 * 60 * 24,
  });
}
