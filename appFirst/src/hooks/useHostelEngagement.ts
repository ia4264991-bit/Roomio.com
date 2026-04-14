import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ReactionValue = "like" | "dislike";

export interface HostelEngagement {
  liked: boolean;
  disliked: boolean;
}

type SummaryMap = Record<string, { likes: number; dislikes: number; comments: number }>;
type MyReactionMap = Record<string, ReactionValue>;

const SAVED_KEY = "savedHostels";
const GUEST_KEY = "roomio_guest_id";

const parseSaved = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
};

export const useHostelEngagement = () => {
  const queryClient = useQueryClient();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    setSavedIds(parseSaved());
    const existing = localStorage.getItem(GUEST_KEY);
    if (existing) {
      setGuestId(existing);
      return;
    }
    const created = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(GUEST_KEY, created);
    setGuestId(created);
  }, []);

  const { data: summary = {} } = useQuery({
    queryKey: ["social-summary"],
    queryFn: async (): Promise<SummaryMap> => {
      const { data, error } = await supabase
        .from("hostel_popularity")
        .select("hostel_id, likes, dislikes, comments, popularity_score");
      if (error || !data) return {};

      const mapped: SummaryMap = {};
      for (const row of data as Array<{ hostel_id: string | number; likes: number; dislikes: number; comments: number }>) {
        mapped[String(row.hostel_id)] = {
          likes: row.likes ?? 0,
          dislikes: row.dislikes ?? 0,
          comments: row.comments ?? 0,
        };
      }
      return mapped;
    },
    refetchInterval: 30000,
  });

  const { data: myReactions = {} } = useQuery({
    queryKey: ["my-reactions", guestId],
    enabled: !!guestId,
    queryFn: async (): Promise<MyReactionMap> => {
      const { data, error } = await supabase
        .from("hostel_reactions")
        .select("hostel_id, reaction")
        .eq("user_id", guestId);
      if (error || !data) return {};

      const mapped: MyReactionMap = {};
      for (const row of data as Array<{ hostel_id: string | number; reaction: ReactionValue }>) {
        mapped[String(row.hostel_id)] = row.reaction;
      }
      return mapped;
    },
  });

  const setReactionMutation = useMutation({
    mutationFn: async ({ hostelId, value }: { hostelId: string; value: ReactionValue | null }) => {
      if (!guestId) throw new Error("Missing guest id");
      const hostelIdValue = /^\d+$/.test(hostelId) ? Number(hostelId) : hostelId;

      if (!value) {
        const { error } = await supabase
          .from("hostel_reactions")
          .delete()
          .eq("hostel_id", hostelIdValue)
          .eq("user_id", guestId);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("hostel_reactions").upsert(
        {
          hostel_id: hostelIdValue,
          user_id: guestId,
          reaction: value,
        },
        { onConflict: "hostel_id,user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-summary"] });
      queryClient.invalidateQueries({ queryKey: ["my-reactions", guestId] });
    },
  });

  useEffect(() => {
    const reactionsChannel = supabase
      .channel("roomio-reactions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hostel_reactions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["social-summary"] });
          queryClient.invalidateQueries({ queryKey: ["my-reactions", guestId] });
        },
      )
      .subscribe();

    const commentsChannel = supabase
      .channel("roomio-comments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hostel_comments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["social-summary"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [guestId, queryClient]);

  const toggleSaved = useCallback(
    (id: string) => {
      const isSaved = savedIds.includes(id);
      const next = isSaved ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id];
      setSavedIds(next);
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    },
    [savedIds],
  );

  const toggleLike = useCallback(
    (id: string) => {
      const current = myReactions[id];
      setReactionMutation.mutate({ hostelId: id, value: current === "like" ? null : "like" });
    },
    [myReactions, setReactionMutation],
  );

  const toggleDislike = useCallback(
    (id: string) => {
      const current = myReactions[id];
      setReactionMutation.mutate({ hostelId: id, value: current === "dislike" ? null : "dislike" });
    },
    [myReactions, setReactionMutation],
  );

  const getEngagement = useCallback(
    (id: string): HostelEngagement => {
      const reaction = myReactions[id];
      return {
        liked: reaction === "like",
        disliked: reaction === "dislike",
      };
    },
    [myReactions],
  );

  const getPopularityScore = useCallback(
    (id: string) => {
      const row = summary[id] || { likes: 0, dislikes: 0, comments: 0 };
      return row.likes * 2 + row.comments - row.dislikes;
    },
    [summary],
  );

  const getCounts = useCallback(
    (id: string) => summary[id] || { likes: 0, dislikes: 0, comments: 0 },
    [summary],
  );

  const stats = useMemo(() => {
    return Object.values(summary).reduce(
      (acc, item) => {
        acc.likes += item.likes;
        acc.dislikes += item.dislikes;
        acc.comments += item.comments;
        return acc;
      },
      { likes: 0, dislikes: 0, comments: 0 },
    );
  }, [summary]);

  return {
    savedIds,
    stats,
    toggleSaved,
    toggleLike,
    toggleDislike,
    getEngagement,
    getPopularityScore,
    getCounts,
  };
};
