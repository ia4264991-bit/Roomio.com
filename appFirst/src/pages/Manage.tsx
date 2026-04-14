import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import AppFrame from "@/components/AppFrame";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useCreateShort, useDeleteShort, useShorts } from "@/hooks/useShorts";

const Manage = () => {
  const { user } = useAuthUser();
  const { data: shorts = [] } = useShorts();
  const createShort = useCreateShort();
  const deleteShort = useDeleteShort();

  const myShorts = useMemo(() => shorts.filter((item) => item.user_id === user?.id), [shorts, user?.id]);
  const [form, setForm] = useState({
    title: "",
    price: "",
    location: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;
    try {
      await createShort.mutateAsync({ ...form, video: videoFile });
      toast.success("Short uploaded.");
      setForm({ title: "", price: "", location: "", description: "" });
      setVideoFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Short upload failed.");
    }
  };

  return (
    <AppFrame>
      <header className="border-b border-border bg-background/85">
        <div className="container px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">Manage Account</h1>
            <p className="text-sm text-muted-foreground">Post and manage your hostel shorts.</p>
          </div>
          <Link to="/shorts" className="text-sm text-muted-foreground hover:text-primary">
            Open Shorts feed
          </Link>
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-5 space-y-5">
        {!user ? (
          <div className="rounded-2xl border border-border bg-card/70 p-5 space-y-3">
            <p className="text-sm text-muted-foreground">Sign in to upload and manage your videos.</p>
            <Link
              to="/login"
              className="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card/70 p-4 grid gap-2">
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Short title"
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
                required
              />
              <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" required />
              <div className="grid sm:grid-cols-2 gap-2">
                <input
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="Price"
                  className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
                  required
                />
                <input
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Location"
                  className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
                  required
                />
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm min-h-24"
                required
              />
              <button className="rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground inline-flex items-center justify-center gap-2">
                <UploadCloud className="w-4 h-4" />
                Upload short
              </button>
            </form>

            <section className="space-y-3">
              <h2 className="font-heading text-lg font-semibold">Your Shorts</h2>
              {myShorts.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have not uploaded shorts yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myShorts.map((short) => (
                    <article key={short.id} className="rounded-xl border border-border bg-card overflow-hidden">
                      <video src={short.video_url} controls className="w-full aspect-[9/16] object-cover bg-black" />
                      <div className="p-3 space-y-1.5">
                        <p className="font-semibold">{short.title}</p>
                        <p className="text-sm text-primary">{short.price}</p>
                        <p className="text-xs text-muted-foreground">{short.location}</p>
                        <button
                          onClick={() => deleteShort.mutate(short.id)}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete short
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </AppFrame>
  );
};

export default Manage;
