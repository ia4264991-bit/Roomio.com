import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import AppFrame from "@/components/AppFrame";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useHostels } from "@/hooks/useHostels";
import { supabase } from "@/lib/supabase";
import type { Hostel } from "@/data/hostels";

const emptyForm = {
  name: "",
  location: "",
  phone: "",
  price: "",
  description: "",
};

const STORAGE_BUCKET = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined)?.trim() || "roomio-media";

const getPublicUrl = (path: string) => supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;

const Admin = () => {
  const { user } = useAuthUser();
  const { data: hostels = [] } = useHostels();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingVideoUrl, setExistingVideoUrl] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setVideoFile(null);
    setImageFiles([]);
    setExistingVideoUrl("");
    setExistingImages([]);
  };

  const uploadFile = async (file: File, folder: "hostels/videos" | "hostels/images") => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, { upsert: false });
    if (error) throw error;
    return getPublicUrl(filePath);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let videoUrl = existingVideoUrl;
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "hostels/videos");
      }
      if (!videoUrl) throw new Error("Please upload a hostel video.");

      let imageUrls = existingImages;
      if (imageFiles.length > 0) {
        imageUrls = await Promise.all(imageFiles.map((img) => uploadFile(img, "hostels/images")));
      }

      const payload: Omit<Hostel, "id"> = {
        name: form.name.trim(),
        video: videoUrl,
        images: imageUrls,
        location: form.location.trim(),
        phone: form.phone.trim(),
        price: form.price.trim(),
        description: form.description.trim(),
      };

      if (editingId) {
        const { error } = await supabase.from("hostels").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Hostel updated in Supabase.");
      } else {
        const { error } = await supabase.from("hostels").insert(payload);
        if (error) throw error;
        toast.success("Hostel inserted into Supabase.");
      }

      resetForm();
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to save hostel.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const onEdit = (hostel: Hostel) => {
    setEditingId(hostel.id);
    setForm({
      name: hostel.name || "",
      location: hostel.location || "",
      phone: hostel.phone || "",
      price: hostel.price || "",
      description: hostel.description || "",
    });
    setExistingVideoUrl(hostel.video || "");
    setExistingImages(hostel.images || []);
    setVideoFile(null);
    setImageFiles([]);
  };

  const onDelete = async (id: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.from("hostels").delete().eq("id", id);
      if (error) throw error;
      toast.success("Hostel deleted from Supabase.");
      if (editingId === id) resetForm();
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete hostel.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppFrame>
      <main className="container px-4 sm:px-6 py-5 space-y-6">
        <section className="rounded-2xl border border-border bg-card/70 p-4">
          <h1 className="font-heading text-xl font-bold mb-1">Admin Supabase Hostel Manager</h1>
          <p className="text-xs text-muted-foreground mb-3">
            Create, edit, and delete rows directly in your Supabase `hostels` table. Media uploads go to Supabase Storage bucket `{STORAGE_BUCKET}`.
          </p>
          <form onSubmit={onSubmit} className="grid gap-2">
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Hostel name" className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" required />
            <label className="text-xs text-muted-foreground">Hostel video (upload file)</label>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
            {existingVideoUrl && !videoFile && <p className="text-[11px] text-muted-foreground">Keeping current video.</p>}
            <label className="text-xs text-muted-foreground">Hostel images (upload one or more files)</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" />
            {existingImages.length > 0 && imageFiles.length === 0 && <p className="text-[11px] text-muted-foreground">Keeping {existingImages.length} existing image(s).</p>}
            <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Location" className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" required />
            <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" required />
            <input value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="Price" className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm" required />
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm min-h-24" required />
            <div className="flex gap-2">
              <button disabled={busy} className="rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                {busy ? "Please wait..." : editingId ? "Update hostel" : "Create hostel"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm">
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg font-semibold">Hostels in Supabase</h2>
          {hostels.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2 gap-3">
              <span className="truncate">{h.name}</span>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => onEdit(h)} disabled={busy} className="text-sm text-primary hover:underline">
                  Edit
                </button>
                <button onClick={() => onDelete(h.id)} disabled={busy} className="text-sm text-red-400 hover:text-red-300">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </AppFrame>
  );
};

export default Admin;
