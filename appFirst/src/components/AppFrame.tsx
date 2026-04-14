import { Link, useLocation } from "react-router-dom";
import type { ComponentType, ReactNode } from "react";
import { Bookmark, Clapperboard, Home, Settings, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/hooks/useAuthUser";

interface AppFrameProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

interface NavItem {
  label: string;
  icon: ComponentType<{ className?: string }>;
  to: string;
  hash?: string;
}

const AppFrame = ({ children, sidebar }: AppFrameProps) => {
  const location = useLocation();
  const { user, signOut } = useAuthUser();

  const navItems: NavItem[] = [
    { label: "Home", icon: Home, to: "/" },
    { label: "Shorts", icon: Clapperboard, to: "/shorts" },
    { label: "Saved", icon: Bookmark, to: "/saved" },
  ];
  const signedInItems: NavItem[] = [
    { label: "Manage", icon: Settings, to: "/manage" },
    { label: "Profile", icon: UserCircle2, to: "/profile" },
    ...(user?.role === "admin" ? [{ label: "Admin", icon: Settings, to: "/admin" }] : []),
  ];
  const allNavItems = [...navItems, ...(user ? signedInItems : [])];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <Link to="/" className="text-sm font-heading font-semibold">
            Roomio.com
          </Link>
          {!user ? (
            <Link
              to="/login"
              className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-4 py-2"
            >
              Sign in
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground">{user.email}</span>
              <button onClick={() => signOut()} className="text-xs text-muted-foreground hover:text-primary">
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block border-r border-border bg-card/40">
          <div className="sticky top-0 p-4 h-screen overflow-y-auto space-y-4">
            <Link to="/" className="block rounded-xl gradient-primary p-4 text-primary-foreground">
              <p className="text-xs uppercase tracking-wide opacity-85">Roomio.com</p>
              <h2 className="font-heading text-xl font-bold">UCC Hostels</h2>
              <p className="text-xs opacity-85 mt-1">Explore hostels, shorts, and reviews</p>
            </Link>

            <nav className="space-y-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const active = item.hash
                  ? location.pathname === "/" && location.hash === item.hash
                  : item.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {sidebar}
          </div>
        </aside>

        <div className="pb-20 lg:pb-0">{children}</div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 lg:hidden border-t border-border bg-background/95 backdrop-blur-md safe-bottom z-50">
        <div className="px-2 py-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(allNavItems.length, 1)}, minmax(0, 1fr))` }}>
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.hash
              ? location.pathname === "/" && location.hash === item.hash
              : item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppFrame;
