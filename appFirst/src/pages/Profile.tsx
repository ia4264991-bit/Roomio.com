import { Link } from "react-router-dom";
import AppFrame from "@/components/AppFrame";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useShorts } from "@/hooks/useShorts";

const Profile = () => {
  const { user } = useAuthUser();
  const { data: shorts = [] } = useShorts();
  const myShortCount = shorts.filter((item) => item.user_id === user?.id).length;

  return (
    <AppFrame>
      <header className="border-b border-border bg-background/85">
        <div className="container px-4 sm:px-6 py-4">
          <h1 className="font-heading text-xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Your community identity and contribution stats.</p>
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-5">
        {!user ? (
          <div className="rounded-2xl border border-border bg-card/70 p-5 space-y-3">
            <p className="text-sm text-muted-foreground">Sign in to view your profile and manage account.</p>
            <Link
              to="/login"
              className="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <section className="rounded-2xl border border-border bg-card/70 p-5 space-y-3">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-semibold">{user.email}</p>
            <p className="text-sm text-muted-foreground pt-2">Uploaded shorts</p>
            <p className="text-2xl font-heading font-bold text-primary">{myShortCount}</p>
            <Link to="/manage" className="inline-block rounded-lg bg-secondary px-4 py-2 text-sm font-semibold">
              Open Manage Account
            </Link>
          </section>
        )}
      </main>
    </AppFrame>
  );
};

export default Profile;
