import { Link } from "react-router-dom";
import { MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Hostel } from "@/data/hostels";
import type { HostelEngagement } from "@/hooks/useHostelEngagement";
import { cn } from "@/lib/utils";

interface HostelCardProps {
  hostel: Hostel;
  index: number;
  engagement?: HostelEngagement;
  popularityScore?: number;
  likes?: number;
  dislikes?: number;
  comments?: number;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onToggleLike?: (id: string) => void;
  onToggleDislike?: (id: string) => void;
}

const HostelCard = ({
  hostel,
  index,
  engagement,
  popularityScore = 0,
  likes = 0,
  dislikes = 0,
  comments = 0,
  isSaved = false,
  onToggleSave,
  onToggleLike,
  onToggleDislike,
}: HostelCardProps) => {
  const image = hostel.images?.[0];

  return (
    <div
      className="rounded-2xl overflow-hidden gradient-card shadow-card hover:shadow-glow transition-all duration-300 group border border-border/70"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link to={`/hostel/${hostel.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={hostel.name}
              loading="lazy"
              width={800}
              height={500}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/50 via-accent/45 to-pink-500/45" />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2 flex items-center justify-between">
            <span className="font-heading font-bold text-primary text-xs">{hostel.price}</span>
            <span className="text-[11px] rounded-full bg-background/75 px-2 py-1">
              🔥 {popularityScore}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-3 space-y-2">
        <h3 className="font-heading font-semibold text-foreground text-sm leading-tight">{hostel.name}</h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{hostel.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleLike?.(hostel.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs flex items-center gap-1",
              engagement?.liked ? "bg-primary text-primary-foreground border-primary" : "border-border bg-secondary",
            )}
          >
            <ThumbsUp className="w-3 h-3" />
            Like {likes}
          </button>
          <button
            onClick={() => onToggleDislike?.(hostel.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs flex items-center gap-1",
              engagement?.disliked ? "bg-destructive text-destructive-foreground border-destructive" : "border-border bg-secondary",
            )}
          >
            <ThumbsDown className="w-3 h-3" />
            Dislike {dislikes}
          </button>
          <button
            onClick={() => onToggleSave?.(hostel.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs ml-auto",
              isSaved ? "bg-accent text-accent-foreground border-accent" : "border-border bg-secondary",
            )}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">Comments {comments}</p>
      </div>
    </div>
  );
};

export default HostelCard;


