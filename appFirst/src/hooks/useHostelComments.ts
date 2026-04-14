import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface HostelComment {
  id: string;
  hostel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string;
}

const GUEST_KEY = "roomio_guest_id";

const ensureGuestId = () => {
  const existing = localStorage.getItem(GUEST_KEY);
  if (existing) return existing;
  const created = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(GUEST_KEY, created);
  return created;
};

const normalizeHostelId = (hostelId?: string) => {
  if (!hostelId) return null;
  return /^\d+$/.test(hostelId) ? Number(hostelId) : hostelId;
};

const formatSupabaseError = (error: unknown, fallback: string) => {
  const e = error as { message?: string; details?: string; hint?: string; code?: string } | null;
  const msg = e?.message || fallback;
  const extras = [e?.details, e?.hint, e?.code].filter(Boolean).join(" | ");
  return extras ? `${msg} (${extras})` : msg;
};

export const useHostelComments = (hostelId?: string) => {
  const queryClient = useQueryClient();
  const hostelIdValue = normalizeHostelId(hostelId);

  useEffect(() => {
    if (!hostelIdValue) return;
    const channel = supabase
      .channel(`roomio-comments-${String(hostelIdValue)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hostel_comments",
          filter: `hostel_id=eq.${hostelIdValue}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["hostel-comments", hostelId] });
          queryClient.invalidateQueries({ queryKey: ["social-summary"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hostelId, hostelIdValue, queryClient]);

  return useQuery({
    queryKey: ["hostel-comments", hostelId],
    enabled: !!hostelIdValue,
    queryFn: async (): Promise<HostelComment[]> => {
      let { data, error } = await supabase
        .from("hostel_comments")
        .select("id, hostel_id, user_id, content, created_at, author_name")
        .eq("hostel_id", hostelIdValue)
        .order("created_at", { ascending: false });

      if (error) {
        // Backward compatibility if author_name column was not added yet.
        const fallback = await supabase
          .from("hostel_comments")
          .select("id, hostel_id, user_id, content, created_at")
          .eq("hostel_id", hostelIdValue)
          .order("created_at", { ascending: false });
        data = fallback.data as typeof data;
        error = fallback.error;
      }

      if (error || !data) return [];
      return (data as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id),
        hostel_id: String(row.hostel_id),
        user_id: String(row.user_id),
        content: String(row.content || ""),
        created_at: String(row.created_at || ""),
        author_name: String(row.author_name || "Guest"),
      }));
    },
    refetchInterval: 30000,
  });
};

export const useCreateComment = (hostelId?: string) => {
  const queryClient = useQueryClient();
  const hostelIdValue = normalizeHostelId(hostelId);
  return useMutation({
    mutationFn: async (content: string) => {
      if (!hostelIdValue) throw new Error("Hostel missing");
      if (content.trim().length < 2) throw new Error("Comment is too short.");
      const rawUser = localStorage.getItem("roomio_user");
      const user = rawUser ? (JSON.parse(rawUser) as { id?: string; name?: string; email?: string }) : null;
      const guestId = ensureGuestId();
      const userId = user?.id ? `user:${user.id}` : `guest:${guestId}`;
      const authorName = user?.name || user?.email || "Guest";

      const { error } = await supabase.from("hostel_comments").insert({
        hostel_id: hostelIdValue,
        user_id: userId,
        author_name: authorName,
        content: content.trim(),
      });
      if (!error) return;

      // Backward compatibility if author_name column was not added yet.
      const retry = await supabase.from("hostel_comments").insert({
        hostel_id: hostelIdValue,
        user_id: userId,
        content: content.trim(),
      });
      if (retry.error) {
        throw new Error(
          formatSupabaseError(
            retry.error,
            "Failed to post comment. Check hostel_comments table columns/policies in Supabase.",
          ),
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel-comments", hostelId] });
      queryClient.invalidateQueries({ queryKey: ["social-summary"] });
    },
  });
};
