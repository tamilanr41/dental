import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, BookOpenText, Film, Image, Images, LoaderCircle, Megaphone, Pencil, Plus, Save, Sparkles, Trash2, Video, X } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Modal } from "@/components/ui/Modal";
import { api, resolveApiAsset, SITE_CONTENT_TYPES, type SiteContent, type SiteContentType } from "@/lib/api";

type Draft = {
  title: string;
  subtitle: string;
  body: string;
  mediaUrl: string;
  linkUrl: string;
  badgeText: string;
  published: boolean;
  displayOrder: number;
};

const typeInfo: Record<SiteContentType, { label: string; hint: string; icon: typeof Image }> = {
  hero: { label: "Hero banners", hint: "Top-of-home banner images and messages.", icon: Images },
  blog: { label: "Blogs", hint: "Published clinic articles appear on the home page.", icon: BookOpenText },
  offer: { label: "Offer banners", hint: "Current treatment offers and campaign cards.", icon: Megaphone },
  reel: { label: "Reels", hint: "Short vertical videos from the clinic.", icon: Film },
  video: { label: "Videos", hint: "Clinic and treatment videos.", icon: Video },
  image: { label: "Images", hint: "Photos shown in the public clinic gallery.", icon: Image },
  badge: { label: "Badges", hint: "Awards, recognitions and accreditations.", icon: BadgeCheck },
};

const emptyDraft = (): Draft => ({
  title: "",
  subtitle: "",
  body: "",
  mediaUrl: "",
  linkUrl: "",
  badgeText: "",
  published: false,
  displayOrder: 0,
});

function mediaIsVideo(url: string) {
  return /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(url);
}

export default function SiteContentPage() {
  const [type, setType] = useState<SiteContentType>("blog");
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SiteContent | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const fileRef = useRef<HTMLInputElement>(null);

  const info = typeInfo[type];
  const visibleItems = useMemo(() => items.filter((item) => item.type === type), [items, type]);
  const publishedCount = visibleItems.filter((item) => item.published).length;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<{ items: SiteContent[] }>("/api/admin/content");
      setItems(data.items ?? []);
    } catch (cause) {
      setItems([]);
      setError(cause instanceof Error ? cause.message : "Could not load website content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const startCreate = () => {
    setEditing(null);
    setDraft(emptyDraft());
    setModalOpen(true);
  };

  const startEdit = (item: SiteContent) => {
    setEditing(item);
    setDraft({
      title: item.title,
      subtitle: item.subtitle,
      body: item.body,
      mediaUrl: item.mediaUrl,
      linkUrl: item.linkUrl,
      badgeText: item.badgeText,
      published: item.published,
      displayOrder: item.displayOrder,
    });
    setModalOpen(true);
  };

  const update = (key: keyof Draft, value: string | boolean | number) => {
    setDraft((current) => ({ ...current, [key]: value }) as Draft);
  };

  const uploadFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await api.upload(file);
      update("mediaUrl", uploaded.url);
      toast.success("Media uploaded to the clinic site");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not upload this file.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim() || saving || uploading) return;
    setSaving(true);
    try {
      const payload = { ...draft, title: draft.title.trim(), type, displayOrder: Number(draft.displayOrder) };
      if (editing) await api.patch("/api/admin/content/" + editing.id, payload);
      else await api.post("/api/admin/content", payload);
      toast.success(editing ? "Website content updated" : "Website content created");
      setModalOpen(false);
      await refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not save this content.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: SiteContent) => {
    if (!window.confirm("Delete “" + item.title + "” from the website?")) return;
    try {
      await api.delete("/api/admin/content/" + item.id);
      toast.success("Content deleted");
      await refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not delete this content.");
    }
  };

  const togglePublish = async (item: SiteContent) => {
    try {
      await api.patch("/api/admin/content/" + item.id, { published: !item.published });
      toast.success(item.published ? "Content moved to drafts" : "Content published on the website");
      await refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update publish status.");
    }
  };

  const accept = type === "reel" || type === "video"
    ? "video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp,image/avif,image/gif";

  return (
    <DashboardLayout>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> Public website</span>
          <h1 className="mt-3 text-display-3 text-foreground">Website content</h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            Manage the home page, publish clinic updates, and add media that visitors can see.
          </p>
        </div>
        <Button onClick={startCreate}><Plus className="h-4 w-4" /> Add {info.label.replace(/s$/, "")}</Button>
      </div>

      <div className="mb-6 grid gap-3 rounded-3xl border border-border/70 bg-card p-3 shadow-soft sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {SITE_CONTENT_TYPES.map((value) => {
          const Icon = typeInfo[value].icon;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={"flex min-w-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition " + (type === value ? "bg-ink-950 text-white shadow-card" : "text-muted-foreground hover:bg-secondary-50 hover:text-foreground")}
            >
              <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-xl " + (type === value ? "bg-white/10 text-accent-200" : "bg-primary-50 text-primary-700")}><Icon className="h-4 w-4" /></span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{typeInfo[value].label}</span>
                <span className={"mt-0.5 block text-[10px] " + (type === value ? "text-white/55" : "text-muted-foreground/70")}>{items.filter((item) => item.type === value).length} items</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">{info.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{info.hint}</p>
        </div>
        <span className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">{publishedCount} published · {visibleItems.length - publishedCount} drafts</span>
      </div>

      {error && <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}

      {loading ? (
        <div className="grid min-h-56 place-items-center rounded-3xl border border-border/70 bg-card"><LoaderCircle className="h-6 w-6 animate-spin text-primary-700" /></div>
      ) : visibleItems.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
              {item.mediaUrl && (
                <div className="relative aspect-[1.75/1] overflow-hidden bg-secondary-50">
                  {mediaIsVideo(item.mediaUrl) ? (
                    <video src={resolveApiAsset(item.mediaUrl)} controls playsInline preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    <img src={resolveApiAsset(item.mediaUrl)} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-ink-950/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">{item.type}</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-medium text-foreground" title={item.title}>{item.title}</h3>
                    {item.subtitle && <p className="mt-1 truncate text-xs text-muted-foreground">{item.subtitle}</p>}
                  </div>
                  <span className={"shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] " + (item.published ? "bg-emerald-50 text-emerald-700" : "bg-secondary-100 text-muted-foreground")}>{item.published ? "Published" : "Draft"}</span>
                </div>
                {item.badgeText && <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-1 text-[10px] font-bold text-accent-800"><Sparkles className="h-3 w-3" />{item.badgeText}</p>}
                {item.body && <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{item.body}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                  <Button size="sm" variant="outline" onClick={() => startEdit(item)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button size="sm" variant={item.published ? "outline" : "primary"} onClick={() => void togglePublish(item)}>{item.published ? "Unpublish" : "Publish"}</Button>
                  <button type="button" onClick={() => void remove(item)} className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-rose-50 hover:text-rose-700" aria-label={"Delete " + item.title}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-border bg-card/70 p-8 text-center">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700"><info.icon className="h-5 w-5" /></span>
            <h3 className="mt-4 font-display text-xl font-medium text-foreground">No {info.label.toLowerCase()} yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Add one here, then publish it to show it on the public website.</p>
            <Button className="mt-5" onClick={startCreate}><Plus className="h-4 w-4" /> Add content</Button>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => !saving && !uploading && setModalOpen(false)} title={(editing ? "Edit " : "Add ") + info.label.replace(/s$/, "")} description="Save as a draft or publish it directly on the clinic website." size="lg">
        <form onSubmit={save} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <Input label="Title" required maxLength={140} value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder={type === "blog" ? "A healthy smile starts with..." : "A short, clear title"} />
          <Input label="Subtitle" maxLength={240} value={draft.subtitle} onChange={(event) => update("subtitle", event.target.value)} placeholder="Optional short summary" />
          {type !== "badge" && <TextArea label={type === "blog" ? "Article text" : "Description"} value={draft.body} onChange={(event) => update("body", event.target.value)} maxLength={6000} placeholder="Add helpful details for visitors..." />}
          {type === "badge" && <Input label="Badge label" maxLength={80} value={draft.badgeText} onChange={(event) => update("badgeText", event.target.value)} placeholder="e.g. Certified / Awarded 2025" />}
          {type !== "badge" && type !== "blog" && <Input label="Badge or offer label" maxLength={80} value={draft.badgeText} onChange={(event) => update("badgeText", event.target.value)} placeholder="e.g. Limited offer / New" />}
          <Input label="Link URL" type="text" value={draft.linkUrl} onChange={(event) => update("linkUrl", event.target.value)} placeholder="https://... or use /booking" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Display order" type="number" min={0} max={9999} value={draft.displayOrder} onChange={(event) => update("displayOrder", Number(event.target.value))} />
            <label className="flex items-end gap-2 pb-2 text-sm font-medium text-foreground/75">
              <input type="checkbox" checked={draft.published} onChange={(event) => update("published", event.target.checked)} className="mb-0.5 h-4 w-4 accent-primary" />
              Publish on public website
            </label>
          </div>
          <div className="rounded-2xl border border-border/70 bg-secondary-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Image or video</p>
                <p className="mt-1 text-xs text-muted-foreground">Upload a file or paste an HTTPS media URL below.</p>
              </div>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold text-foreground transition hover:bg-secondary-50">
                {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Upload media
                <input ref={fileRef} type="file" accept={accept} disabled={uploading} className="sr-only" onChange={(event) => void uploadFile(event.target.files?.[0])} />
              </label>
            </div>
            <Input className="mt-3" label="Media URL" type="text" value={draft.mediaUrl.startsWith("/api/") ? "" : draft.mediaUrl} onChange={(event) => update("mediaUrl", event.target.value)} placeholder="https://... (uploading fills this automatically)" />
            {draft.mediaUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-card">
                {mediaIsVideo(draft.mediaUrl) ? <video src={resolveApiAsset(draft.mediaUrl)} controls playsInline preload="metadata" className="max-h-56 w-full bg-ink-950 object-contain" /> : <img src={resolveApiAsset(draft.mediaUrl)} alt="Media preview" className="max-h-56 w-full bg-white object-contain" />}
                <button type="button" onClick={() => update("mediaUrl", "")} className="flex w-full items-center justify-center gap-1.5 border-t border-border/60 py-2 text-xs font-medium text-muted-foreground transition hover:bg-rose-50 hover:text-rose-700"><X className="h-3.5 w-3.5" /> Remove media</button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-border/70 pt-4">
            <Button type="button" variant="outline" disabled={saving || uploading} onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving} disabled={uploading}><Save className="h-4 w-4" /> {editing ? "Save changes" : "Create content"}</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}