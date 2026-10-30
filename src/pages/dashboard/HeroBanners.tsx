import { ContentManager, type ContentDraft } from "@/components/dashboard/ContentManager";
import { resolveApiAsset } from "@/lib/api";

function HeroPreview({ draft }: { draft: ContentDraft }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-ink-950">
      {draft.mediaUrl ? (
        <img
          src={resolveApiAsset(draft.mediaUrl)}
          alt=""
          className="aspect-[4/4.6] w-full object-cover"
        />
      ) : (
        <div className="grid aspect-[4/4.6] place-items-center px-6 text-center text-xs text-white/60">
          Add a hero image
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/85 to-transparent p-4">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/60">
          Slides into the homepage hero
        </p>
        <p className="mt-1 text-[12.5px] text-white/80">
          Headline, buttons and clinic text stay the same.
        </p>
      </div>
    </div>
  );
}

export default function HeroBannersPage() {
  return (
    <ContentManager
      type="hero"
      heading="Hero banners"
      description="Upload a photo — it joins the homepage hero slideshow. Only the image changes; the headline, buttons and clinic text stay the same."
      addLabel="Add hero banner"
      fields={["title", "mediaUrl", "mobileMediaUrl", "displayOrder", "published"]}
      requiredMedia={["mediaUrl"]}
      preview={(draft) => <HeroPreview draft={draft} />}
    />
  );
}
