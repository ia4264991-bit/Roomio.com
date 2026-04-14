import { useRef } from "react";
import { Link } from "react-router-dom";
import type { HostelShort } from "@/hooks/useShorts";

interface HomeShortsStripProps {
  shorts: HostelShort[];
}

/** Facebook-style horizontal reel strip: snap scroll, hover-to-preview. */
const HomeShortsStrip = ({ shorts }: HomeShortsStripProps) => {
  const videoEls = useRef<Record<string, HTMLVideoElement | null>>({});

  if (shorts.length === 0) return null;

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:mx-0">
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-0 pb-3 pt-1 scrollbar-hide"
        style={{ scrollPaddingInline: "1rem" }}
      >
        {shorts.map((short, idx) => (
          <Link
            key={short.id}
            to={`/shorts?start=${idx}`}
            className="snap-center shrink-0 w-[148px] sm:w-[168px] rounded-2xl border border-border bg-card overflow-hidden shadow-card hover:shadow-glow hover:border-primary/40 transition-all active:scale-[0.98]"
          >
            <div
              className="relative aspect-[9/14] bg-black"
              onMouseEnter={() => {
                const v = videoEls.current[short.id];
                if (v) {
                  v.muted = true;
                  v.play().catch(() => {});
                }
              }}
              onMouseLeave={() => {
                const v = videoEls.current[short.id];
                if (v) {
                  v.pause();
                  v.currentTime = 0;
                }
              }}
            >
              <video
                ref={(el) => {
                  videoEls.current[short.id] = el;
                }}
                src={short.video_url}
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                loop
                preload="metadata"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-8">
                <p className="text-[11px] font-semibold text-white truncate">{short.title}</p>
                <p className="text-[10px] text-primary font-medium">{short.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeShortsStrip;
