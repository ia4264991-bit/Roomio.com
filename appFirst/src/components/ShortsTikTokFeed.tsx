import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import type { HostelShort } from "@/hooks/useShorts";

interface ShortsTikTokFeedProps {
  shorts: HostelShort[];
}

const SLIDE =
  "min-h-[calc(100dvh-10.5rem)] sm:min-h-[calc(100dvh-9rem)] lg:min-h-[calc(100dvh-6rem)]";
const SHORTS_SOUND_KEY = "roomio_shorts_muted";

/** TikTok-style vertical snap: scroll up/down one short at a time; active clip plays. */
const ShortsTikTokFeed = ({ shorts }: ShortsTikTokFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoById = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(SHORTS_SOUND_KEY);
    return saved ? saved === "true" : true;
  });
  const [searchParams] = useSearchParams();
  const startRaw = searchParams.get("start");
  const startIdx = Math.max(0, Math.min(shorts.length - 1, parseInt(startRaw || "0", 10) || 0));

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || shorts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            video.currentTime = 0;
            video.muted = isMuted;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { root, threshold: [0, 0.35, 0.5, 0.65, 1] },
    );

    shorts.forEach((s) => {
      const v = videoById.current.get(s.id);
      if (v) observer.observe(v);
    });

    return () => {
      videoById.current.forEach((v) => observer.unobserve(v));
      observer.disconnect();
    };
  }, [isMuted, shorts]);

  useEffect(() => {
    localStorage.setItem(SHORTS_SOUND_KEY, String(isMuted));
    videoById.current.forEach((video) => {
      video.muted = isMuted;
    });
  }, [isMuted]);

  useEffect(() => {
    if (startIdx <= 0 || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-short-index="${startIdx}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [startIdx, shorts.length]);

  return (
    <div
      ref={scrollRef}
      className="h-[calc(100dvh-10.5rem)] sm:h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-6rem)] overflow-y-auto snap-y snap-mandatory overscroll-y-contain scrollbar-hide [scroll-behavior:smooth] bg-black"
    >
      {shorts.map((short, i) => (
        <div
          key={short.id}
          data-short-index={i}
          className={`snap-start ${SLIDE} h-full relative bg-black border-b border-border/40 flex items-center justify-center px-2 sm:px-4`}
        >
          <div className="relative h-[96%] w-full max-w-[420px] lg:max-w-[440px] overflow-hidden rounded-xl border border-white/10">
            <video
              ref={(el) => {
                if (el) videoById.current.set(short.id, el);
                else videoById.current.delete(short.id);
              }}
              src={short.video_url}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              loop
              muted={isMuted}
              controls
              preload="metadata"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30 pointer-events-none" />
            <p className="absolute top-2 left-0 right-0 text-center text-[10px] text-white/70 pointer-events-none px-2">
              Autoplay policy applies on first play · Sound preference is remembered
            </p>

            <button
              type="button"
              onClick={() => {
                const v = videoById.current.get(short.id);
                if (!v) return;
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                v.muted = nextMuted;
                if (v.paused) v.play().catch(() => {});
              }}
              className="absolute top-3 right-3 rounded-full bg-black/45 p-2 text-white hover:bg-black/65"
              aria-label="Toggle sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white space-y-1.5 pointer-events-none">
              <p className="font-heading font-semibold text-base sm:text-lg">Roomio • {short.title}</p>
              <p className="text-sm text-primary-foreground/90">{short.price}</p>
              <p className="text-xs text-white/80">{short.location}</p>
              <p className="text-sm text-white/85 line-clamp-3">{short.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShortsTikTokFeed;
