import { Link } from "react-router-dom";
import { Film } from "lucide-react";
import AppFrame from "@/components/AppFrame";
import ShortsTikTokFeed from "@/components/ShortsTikTokFeed";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useShorts } from "@/hooks/useShorts";

const Shorts = () => {
  const { user } = useAuthUser();
  const { data: shorts = [], isLoading } = useShorts();

  return (
    <AppFrame>
      <header className="shrink-0 border-b border-border bg-background/90 backdrop-blur-md z-10">
        <div className="container px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-lg font-bold flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" />
              Shorts
            </h1>
            <p className="text-xs text-muted-foreground">Swipe up · one video per screen</p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <Link to="/manage" className="text-xs sm:text-sm text-muted-foreground hover:text-primary">
                Upload
              </Link>
            )}
            <Link to="/" className="text-xs sm:text-sm text-muted-foreground hover:text-primary">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="px-0">
        {isLoading ? (
          <p className="text-sm text-muted-foreground px-4 py-6">Loading shorts…</p>
        ) : shorts.length === 0 ? (
          <p className="text-sm text-muted-foreground px-4 py-6">No shorts yet. Upload from Manage when you are signed in.</p>
        ) : (
          <ShortsTikTokFeed shorts={shorts} />
        )}
      </main>
    </AppFrame>
  );
};

export default Shorts;
