import { ArrowRight, Sparkles } from "lucide-react";
import { ContentManager, type ContentDraft } from "@/components/dashboard/ContentManager";
import { resolveApiAsset } from "@/lib/api";

function OfferPreview({ draft }: { draft: ContentDraft }) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl bg-gradient-to-r from-ink-950 via-primary-900 to-ink-950">
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 text-center text-[10.5px] text-white">
          <Sparkles className="h-3.5 w-3.5 text-accent-300" aria-hidden="true" />
          {draft.mediaUrl && (
            <img
              src={resolveApiAsset(draft.mediaUrl)}
              alt=""
              className="h-5 w-5 rounded-full border border-white/25 object-cover"
            />
          )}
          {draft.badgeText && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-accent-200">
              {draft.badgeText}
            </span>
          )}
          <span className="min-w-0 truncate font-medium">
            {draft.title || "Offer title"}
            {draft.subtitle ? " · " + draft.subtitle : ""}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-accent-200">
            {draft.ctaLabel || "View offer"} <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </span>
        </div>
      </div>
      <p className="text-[11.5px] text-muted-foreground">
        {draft.published
          ? draft.startDate || draft.endDate
            ? "Shown on the public site only within the configured dates."
            : "No dates set — the banner stays visible until you unpublish it."
          : "Draft offers never appear on the public site."}
      </p>
    </div>
  );
}

export default function OffersPage() {
  return (
    <ContentManager
      type="offer"
      heading="Offers & announcement banner"
      description="Manage the slim announcement strip above the navigation. Only published offers inside their start and end dates are shown."
      addLabel="Add offer"
      fields={[
        "title",
        "subtitle",
        "badgeText",
        "mediaUrl",
        "ctaLabel",
        "linkUrl",
        "startDate",
        "endDate",
        "displayOrder",
        "published",
      ]}
      preview={(draft) => <OfferPreview draft={draft} />}
    />
  );
}
