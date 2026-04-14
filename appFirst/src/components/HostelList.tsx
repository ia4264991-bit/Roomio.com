import HostelCard from "./HostelCard";
import type { Hostel } from "@/data/hostels";
import type { HostelEngagement } from "@/hooks/useHostelEngagement";

interface HostelListProps {
  hostels: Hostel[];
  getEngagement?: (id: string) => HostelEngagement;
  getPopularityScore?: (id: string) => number;
  getCounts?: (id: string) => { likes: number; dislikes: number; comments: number };
  isSaved?: (id: string) => boolean;
  onToggleSave?: (id: string) => void;
  onToggleLike?: (id: string) => void;
  onToggleDislike?: (id: string) => void;
}

const HostelList = ({
  hostels,
  getEngagement,
  getPopularityScore,
  getCounts,
  isSaved,
  onToggleSave,
  onToggleLike,
  onToggleDislike,
}: HostelListProps) => {
  if (hostels.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="font-heading text-lg">No hostels found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {hostels.map((hostel, i) => (
        <div key={hostel.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
          {(() => {
            const counts = getCounts?.(hostel.id) || { likes: 0, dislikes: 0, comments: 0 };
            return (
          <HostelCard
            hostel={hostel}
            index={i}
            engagement={getEngagement?.(hostel.id)}
            popularityScore={getPopularityScore?.(hostel.id) ?? 0}
            likes={counts.likes}
            dislikes={counts.dislikes}
            comments={counts.comments}
            isSaved={isSaved?.(hostel.id)}
            onToggleSave={onToggleSave}
            onToggleLike={onToggleLike}
            onToggleDislike={onToggleDislike}
          />
            );
          })()}
        </div>
      ))}
    </div>
  );
};

export default HostelList;
