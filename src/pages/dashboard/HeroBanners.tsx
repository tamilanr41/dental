import { ContentManager, type ContentDraft } from "@/components/dashboard/ContentManager";
import { resolveApiAsset } from "@/lib/api";

function HeroPreview({ draft }: { draft: ContentDraft }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-ink-950">
      {draft.mediaUrl && (
        <img
          src={resolveApiAsset(draft.mediaUrl)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}
      <div className="relative px-5 py-7 text-white">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/50">Homepage hero</p>
        <p className="mt-2 max-w-md font-display text-2xl leading-snug">{draft.title || "Your banner title"}</p>
        {draft.subtitle && <p className="mt-1.5 text-[13px] text-primary-200">{draft.subtitle}</p>}
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11.5px] font-semibold text-ink-950">
          {draft.ctaLabel || "Book an appointment"}
        </span>
      </div>
    </div>
  );
}

export default function HeroBannersPage() {
  return (
    <ContentManager
      type="hero"
      heading="Hero banners"
      description="Banners rotate at the top of the homepage. Published banners appear immediately; drafts stay private."
      addLabel="Add hero banner"
      fields={[
        "title",
        "subtitle",
        "mediaUrl",
        "mobileMediaUrl",
        "ctaLabel",
        "linkUrl",
        "displayOrder",
        "published",
      ]}
      preview={(draft) => <HeroPreview draft={draft} />}
    />
  );
}
