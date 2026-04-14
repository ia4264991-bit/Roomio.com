import { Search, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import HostelList from "@/components/HostelList";
import { useHostels } from "@/hooks/useHostels";
import { useHostelEngagement } from "@/hooks/useHostelEngagement";
import { useColorMode } from "@/hooks/useColorMode";
import ColorModePicker from "@/components/ColorModePicker";
import AppFrame from "@/components/AppFrame";
import { useShorts } from "@/hooks/useShorts";
import HomeShortsStrip from "@/components/HomeShortsStrip";
import RoomioAIChat from "@/components/RoomioAIChat";

function getErrorText(error: unknown): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || "Unknown error";

  const e = error as { message?: string; details?: string; hint?: string; code?: string };
  const combined = [e?.message, e?.details, e?.hint, e?.code].filter(Boolean).join(" | ");
  if (combined) return combined;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

const Index = () => {
  const [search, setSearch] = useState("");
  const { data: hostels = [], isLoading, error } = useHostels();
  const { data: shorts = [] } = useShorts();
  const {
    savedIds,
    stats,
    toggleSaved,
    toggleLike,
    toggleDislike,
    getEngagement,
    getPopularityScore,
    getCounts,
  } = useHostelEngagement();
  const { mode, setMode } = useColorMode();

  const filtered = hostels.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase())
  );

  const popularHostels = [...filtered]
    .sort((a, b) => getPopularityScore(b.id) - getPopularityScore(a.id))
    .slice(0, 4);
  const recentHostels = [...filtered].reverse().slice(0, 4);

  return (
    <AppFrame
      sidebar={
        <div className="space-y-3">
          <ColorModePicker mode={mode} onModeChange={setMode} />
          <div className="rounded-2xl border border-border bg-card/80 p-4 text-sm">
            <p className="font-heading font-semibold mb-2">Community Pulse</p>
            <p className="text-muted-foreground">👍 Likes: {stats.likes}</p>
            <p className="text-muted-foreground">👎 Dislikes: {stats.dislikes}</p>
            <p className="text-muted-foreground">💬 Comments: {stats.comments}</p>
          </div>
        </div>
      }
    >
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="font-heading font-bold text-lg sm:text-xl md:text-2xl text-foreground">
            Roomio.com <span className="text-primary">UCC</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Find your perfect hostel at University of Cape Coast
          </p>
        </div>
      </header>

      <main className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-7">
        <section className="rounded-2xl p-5 bg-gradient-to-r from-primary/25 via-accent/20 to-pink-500/20 border border-primary/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary font-semibold">Colorful Discover</p>
              <h2 className="font-heading text-xl sm:text-2xl font-bold mt-1">Discover hostels your way</h2>
              <p className="text-sm text-muted-foreground mt-1">React, save, watch shorts, and see what students love.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-background/70 px-3 py-1.5">Saved {savedIds.length}</span>
              <span className="rounded-full bg-background/70 px-3 py-1.5">Theme {mode}</span>
            </div>
          </div>
        </section>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search hostels or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body"
          />
        </div>

        <div className="lg:hidden">
          <ColorModePicker mode={mode} onModeChange={setMode} />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Shorts</h2>
            <Link to="/shorts" className="text-sm text-primary font-semibold">
              See all
            </Link>
          </div>
          {shorts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shorts yet — scroll sideways here when there are.</p>
          ) : (
            <HomeShortsStrip shorts={shorts} />
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Popular Hostels
          </h2>
          <HostelList
            hostels={popularHostels}
            getEngagement={getEngagement}
            getPopularityScore={getPopularityScore}
            getCounts={getCounts}
            isSaved={(id) => savedIds.includes(id)}
            onToggleSave={toggleSaved}
            onToggleLike={toggleLike}
            onToggleDislike={toggleDislike}
          />
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">🕒 Recently Added</h2>
          <HostelList
            hostels={recentHostels}
            getEngagement={getEngagement}
            getPopularityScore={getPopularityScore}
            getCounts={getCounts}
            isSaved={(id) => savedIds.includes(id)}
            onToggleSave={toggleSaved}
            onToggleLike={toggleLike}
            onToggleDislike={toggleDislike}
          />
        </div>

        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          All Hostels
        </h2>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading hostels...</div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            Failed to load hostels from Supabase: {getErrorText(error)}
          </div>
        ) : (
          <HostelList
            hostels={filtered}
            getEngagement={getEngagement}
            getPopularityScore={getPopularityScore}
            getCounts={getCounts}
            isSaved={(id) => savedIds.includes(id)}
            onToggleSave={toggleSaved}
            onToggleLike={toggleLike}
            onToggleDislike={toggleDislike}
          />
        )}
      </main>
      <RoomioAIChat hostels={hostels} />
    </AppFrame>
  );
};

export default Index;
