"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CalendarDays, ExternalLink, LoaderCircle, Pencil, Plus, Save, Search, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Modal } from "@/components/ui/Modal";
import { api, resolveApiAsset, type SiteContent, type SiteContentType } from "@/lib/api";
import { formatArticleDate } from "@/lib/blog";

export type ContentField =
  | "title"
  | "subtitle"
  | "slug"
  | "category"
  | "author"
  | "excerpt"
  | "body"
  | "mediaUrl"
  | "mobileMediaUrl"
  | "beforeImage"
  | "afterImage"
  | "linkUrl"
  | "ctaLabel"
  | "badgeText"
  | "startDate"
  | "endDate"
  | "publishedAt"
  | "seoTitle"
  | "seoDescription"
  | "displayOrder"
  | "published";

export type ContentDraft = {
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  body: string;
  mediaUrl: string;
  mobileMediaUrl: string;
  beforeImage: string;
  afterImage: string;
  linkUrl: string;
  ctaLabel: string;
  badgeText: string;
  startDate: string;
  endDate: string;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  displayOrder: number;
  published: boolean;
};

const emptyDraft = (): ContentDraft => ({
  title: "",
  subtitle: "",
  slug: "",
  category: "",
  author: "",
  excerpt: "",
  body: "",
  mediaUrl: "",
  mobileMediaUrl: "",
  beforeImage: "",
  afterImage: "",
  linkUrl: "",
  ctaLabel: "",
  badgeText: "",
  startDate: "",
  endDate: "",
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
  displayOrder: 0,
  published: false,
});

type UploadKey = "mediaUrl" | "mobileMediaUrl" | "beforeImage" | "afterImage";

const mediaIsVideo = (url: string) => /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(url);

function MediaField({
  value,
  label,
  hint,
  accept,
  onChange,
  onUpload,
  uploading,
}: {
  value: string;
  label: string;
  hint?: string;
  accept: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-2xl border border-border/70 bg-secondary-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-secondary-50">
          {uploading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            disabled={uploading}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
        </label>
      </div>
      <Input
        className="mt-3"
        label="Media URL"
        value={value.startsWith("/api/") ? "" : value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://… or upload above"
      />
      {value && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-card">
          {mediaIsVideo(value) ? (
            <video src={resolveApiAsset(value)} controls playsInline preload="metadata" className="max-h-44 w-full bg-ink-950 object-contain" />
          ) : (
            <img src={resolveApiAsset(value)} alt="" className="max-h-44 w-full bg-white object-contain" />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex w-full items-center justify-center gap-1.5 border-t border-border/60 py-2 text-xs font-medium text-muted-foreground transition hover:text-rose-700"
          >
            <X className="h-3.5 w-3.5" /> Remove media
          </button>
        </div>
      )}
    </div>
  );
}

export function ContentManagerPanel({
  type,
  heading,
  description,
  addLabel,
  fields,
  preview,
  requiredMedia = [],
  viewHref,
  categoryFilter = false,
}: {
  type: SiteContentType;
  heading?: string;
  description?: string;
  addLabel: string;
  fields: ContentField[];
  preview?: (draft: ContentDraft) => ReactNode;
  requiredMedia?: UploadKey[];
  viewHref?: (item: SiteContent) => string | null;
  categoryFilter?: boolean;
}) {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadKey | "">("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SiteContent | null>(null);
  const [draft, setDraft] = useState<ContentDraft>(emptyDraft);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<{ items: SiteContent[] }>(`/api/admin/content?type=${type}`);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (cause) {
      setItems([]);
      setError(cause instanceof Error ? cause.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    setDraft({ ...emptyDraft(), author: type === "blog" ? "Sri Saraswathi Dental Clinic" : "" });
    setModalOpen(true);
  };

  const openEdit = (item: SiteContent) => {
    setEditing(item);
    setDraft({
      title: item.title,
      subtitle: item.subtitle,
      slug: item.slug,
      category: item.category,
      author: item.author,
      excerpt: item.excerpt,
      body: item.body,
      mediaUrl: item.mediaUrl,
      mobileMediaUrl: item.mobileMediaUrl,
      beforeImage: item.beforeImage,
      afterImage: item.afterImage,
      linkUrl: item.linkUrl,
      ctaLabel: item.ctaLabel,
      badgeText: item.badgeText,
      startDate: item.startDate,
      endDate: item.endDate,
      publishedAt: item.publishedAt,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      displayOrder: item.displayOrder,
      published: item.published,
    });
    setModalOpen(true);
  };

  const update = <K extends keyof ContentDraft>(key: K, value: ContentDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const upload = async (key: UploadKey, file: File) => {
    setUploading(key);
    try {
      const uploaded = await api.upload(file);
      update(key, uploaded.url);
      toast.success("Image uploaded");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not upload this file.");
    } finally {
      setUploading("");
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || uploading) return;
    if (!draft.title.trim()) {
      toast.error("Add a title before saving.");
      return;
    }
    for (const key of requiredMedia) {
      if (!draft[key]) {
        toast.error(key === "beforeImage" ? "Add the before image." : key === "afterImage" ? "Add the after image." : "Add the required image.");
        return;
      }
    }
    setSaving(true);
    try {
      const payload = { ...draft, type, title: draft.title.trim(), displayOrder: Number(draft.displayOrder) || 0 };
      if (editing) await api.patch(`/api/admin/content/${editing.id}`, payload);
      else await api.post("/api/admin/content", payload);
      toast.success(editing ? "Changes saved" : `${addLabel} created`);
      setModalOpen(false);
      await refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not save this item.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (item: SiteContent) => {
    try {
      await api.patch(`/api/admin/content/${item.id}`, { published: !item.published });
      await refresh();
      toast.success(item.published ? "Moved to drafts" : "Published");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update status.");
    }
  };

  const remove = async (item: SiteContent) => {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/content/${item.id}`);
      await refresh();
      toast.success("Deleted");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not delete this item.");
    }
  };

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(),
    [items],
  );

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!value) return true;
      return [item.title, item.category, item.slug, item.excerpt].some((field) =>
        field.toLowerCase().includes(value),
      );
    });
  }, [items, query, category]);

  const publishedCount = items.filter((item) => item.published).length;
  const mediaAccept =
    type === "reel" || type === "video"
      ? "video/mp4,video/webm,video/quicktime"
      : "image/jpeg,image/png,image/webp,image/avif,image/gif";

  return (
    <>
      {heading && (
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-display-3 text-foreground">{heading}</h1>
            {description && (
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> {addLabel}
          </Button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-muted-foreground">
          {items.length} total · {publishedCount} published · {items.length - publishedCount} drafts
        </p>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {categoryFilter && categories.length > 0 && (
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
              className="h-9 rounded-lg border border-border bg-card px-3 text-[12.5px] text-foreground focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
            >
              <option value="all">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
            />
          </div>
          {!heading && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> {addLabel}
            </Button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}

      {loading ? (
        <div className="grid min-h-52 place-items-center rounded-2xl border border-border/70 bg-card">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary-700" />
        </div>
      ) : visible.length ? (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
          {visible.map((item) => {
            const thumb = item.mediaUrl || item.afterImage;
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5">
                {thumb ? (
                  <img
                    src={resolveApiAsset(thumb)}
                    alt=""
                    loading="lazy"
                    className="h-11 w-16 shrink-0 rounded-lg border border-border/60 bg-secondary-50 object-cover"
                  />
                ) : (
                  <span className="h-11 w-16 shrink-0 rounded-lg border border-dashed border-border" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-muted-foreground">
                    {item.category && <span>{item.category}</span>}
                    {type === "blog" && item.slug && <span className="truncate">/blog/{item.slug}</span>}
                    {(item.startDate || item.endDate) && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {item.startDate ? formatArticleDate(item.startDate) : "—"} → {item.endDate ? formatArticleDate(item.endDate) : "—"}
                      </span>
                    )}
                    {type === "blog" && item.publishedAt && <span>{formatArticleDate(item.publishedAt)}</span>}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
                  <span className={"h-1.5 w-1.5 rounded-full " + (item.published ? "bg-emerald-500" : "bg-border")} />
                  {item.published ? "Published" : "Draft"}
                </span>
                <div className="flex items-center gap-1.5">
                  {viewHref && viewHref(item) && (
                    <Button asChild size="sm" variant="ghost">
                      <a href={viewHref(item) ?? "#"} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void togglePublish(item)}>
                    {item.published ? "Unpublish" : "Publish"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => void remove(item)}
                    aria-label={`Delete ${item.title}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <h2 className="font-display text-xl font-medium text-foreground">Nothing here yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Create your first entry — you can keep it as a draft until it is ready for the public site.
          </p>
          <Button className="mt-5" onClick={openCreate}>
            <Plus className="h-4 w-4" /> {addLabel}
          </Button>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && !uploading && setModalOpen(false)}
        title={editing ? `Edit ${addLabel.toLowerCase()}` : addLabel}
        description="Drafts stay private. Published items appear on the public website immediately."
        size="lg"
      >
        <form onSubmit={save} className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
          {fields.includes("title") && (
            <Input label="Title" required maxLength={140} value={draft.title} onChange={(event) => update("title", event.target.value)} />
          )}
          {fields.includes("slug") && (
            <Input
              label="Slug"
              value={draft.slug}
              onChange={(event) => update("slug", event.target.value)}
              placeholder="auto-generated from the title"
              helperText="Public URL: /blog/your-slug"
            />
          )}
          {fields.includes("subtitle") && (
            <Input
              label={type === "offer" ? "Short promotional message" : "Subtitle"}
              maxLength={240}
              value={draft.subtitle}
              onChange={(event) => update("subtitle", event.target.value)}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.includes("category") && (
              <Input label="Category" maxLength={60} value={draft.category} onChange={(event) => update("category", event.target.value)} placeholder="e.g. Preventive care" />
            )}
            {fields.includes("author") && (
              <Input label="Author" maxLength={80} value={draft.author} onChange={(event) => update("author", event.target.value)} />
            )}
            {fields.includes("badgeText") && (
              <Input label="Label" maxLength={80} value={draft.badgeText} onChange={(event) => update("badgeText", event.target.value)} placeholder="e.g. Limited offer" />
            )}
            {fields.includes("ctaLabel") && (
              <Input label="CTA label" maxLength={40} value={draft.ctaLabel} onChange={(event) => update("ctaLabel", event.target.value)} placeholder="View offer" />
            )}
            {fields.includes("publishedAt") && (
              <Input label="Publication date" type="date" value={draft.publishedAt} onChange={(event) => update("publishedAt", event.target.value)} />
            )}
            {fields.includes("startDate") && (
              <Input label="Start date" type="date" value={draft.startDate} onChange={(event) => update("startDate", event.target.value)} />
            )}
            {fields.includes("endDate") && (
              <Input label="End date" type="date" value={draft.endDate} onChange={(event) => update("endDate", event.target.value)} />
            )}
          </div>
          {fields.includes("excerpt") && (
            <TextArea label="Short excerpt" rows={2} maxLength={400} value={draft.excerpt} onChange={(event) => update("excerpt", event.target.value)} />
          )}
          {fields.includes("body") && (
            <div>
              <TextArea
                label="Full article"
                rows={12}
                maxLength={60000}
                value={draft.body}
                onChange={(event) => update("body", event.target.value)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Blank lines separate paragraphs. Use ## for headings, - for lists and [text](https://…) for links.
              </p>
            </div>
          )}
          {fields.includes("linkUrl") && (
            <Input label="CTA destination" value={draft.linkUrl} onChange={(event) => update("linkUrl", event.target.value)} placeholder="/booking or https://…" />
          )}
          {fields.includes("mediaUrl") && (
            <MediaField
              label={type === "blog" ? "Featured image" : type === "hero" ? "Desktop image" : "Image (optional)"}
              hint={
                type === "hero"
                  ? "Cropped into a portrait frame (4:4.6). Use a portrait photo at least 1080 × 1240 px, subject centred."
                  : type === "blog"
                    ? "Landscape works best — 1200 × 800 px or larger."
                    : type === "gallery"
                      ? "Square crop works best — at least 1000 × 1000 px."
                      : "Use the largest original you have — at least 1000 px wide."
              }
              accept={mediaAccept}
              value={draft.mediaUrl}
              onChange={(value) => update("mediaUrl", value)}
              onUpload={(file) => void upload("mediaUrl", file)}
              uploading={uploading === "mediaUrl"}
            />
          )}
          {fields.includes("mobileMediaUrl") && (
            <MediaField
              label="Mobile image (optional)"
              hint="Shown on phones instead of the desktop image — portrait, at least 720 × 830 px."
              accept={mediaAccept}
              value={draft.mobileMediaUrl}
              onChange={(value) => update("mobileMediaUrl", value)}
              onUpload={(file) => void upload("mobileMediaUrl", file)}
              uploading={uploading === "mobileMediaUrl"}
            />
          )}
          {fields.includes("beforeImage") && (
            <MediaField
              label="Before image"
              accept={mediaAccept}
              value={draft.beforeImage}
              onChange={(value) => update("beforeImage", value)}
              onUpload={(file) => void upload("beforeImage", file)}
              uploading={uploading === "beforeImage"}
            />
          )}
          {fields.includes("afterImage") && (
            <MediaField
              label="After image"
              accept={mediaAccept}
              value={draft.afterImage}
              onChange={(value) => update("afterImage", value)}
              onUpload={(file) => void upload("afterImage", file)}
              uploading={uploading === "afterImage"}
            />
          )}
          {fields.includes("seoTitle") && (
            <Input label="SEO title" maxLength={80} value={draft.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} />
          )}
          {fields.includes("seoDescription") && (
            <TextArea label="SEO description" rows={2} maxLength={200} value={draft.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.includes("displayOrder") && (
              <Input label="Display order" type="number" min={0} max={9999} value={draft.displayOrder} onChange={(event) => update("displayOrder", Number(event.target.value))} />
            )}
            {fields.includes("published") && (
              <label className="flex items-end gap-2 pb-2 text-sm font-medium text-foreground/80">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(event) => update("published", event.target.checked)}
                  className="mb-0.5 h-4 w-4 accent-primary"
                />
                Publish on the public website
              </label>
            )}
          </div>

          {preview && (
            <div className="rounded-2xl border border-border/70 bg-secondary-50/40 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Preview</p>
              {preview(draft)}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border/70 pt-4">
            <Button type="button" variant="outline" disabled={saving || Boolean(uploading)} onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={Boolean(uploading)}>
              <Save className="h-4 w-4" /> {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ContentManager(props: Parameters<typeof ContentManagerPanel>[0]) {
  return (
    <DashboardLayout>
      <ContentManagerPanel {...props} />
    </DashboardLayout>
  );
}
