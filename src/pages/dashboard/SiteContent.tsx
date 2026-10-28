import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContentManagerPanel, type ContentField } from "@/components/dashboard/ContentManager";
import type { SiteContentType } from "@/lib/api";

const groups: {
  type: SiteContentType;
  label: string;
  description: string;
  addLabel: string;
  fields: ContentField[];
}[] = [
  {
    type: "image",
    label: "Clinic photos",
    description: "Photos shown in the public clinic gallery and the homepage media strip.",
    addLabel: "Add photo",
    fields: ["title", "subtitle", "mediaUrl", "displayOrder", "published"],
  },
  {
    type: "badge",
    label: "Credentials",
    description: "Awards, certifications and accreditations shown on the homepage.",
    addLabel: "Add credential",
    fields: ["title", "subtitle", "badgeText", "mediaUrl", "displayOrder", "published"],
  },
  {
    type: "reel",
    label: "Reels",
    description: "Short vertical videos from the clinic.",
    addLabel: "Add reel",
    fields: ["title", "subtitle", "mediaUrl", "displayOrder", "published"],
  },
  {
    type: "video",
    label: "Videos",
    description: "Clinic and treatment videos shown on the website.",
    addLabel: "Add video",
    fields: ["title", "subtitle", "mediaUrl", "displayOrder", "published"],
  },
];

export default function WebsiteContentPage() {
  const [active, setActive] = useState<SiteContentType>("image");
  const group = groups.find((item) => item.type === active) ?? groups[0];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-display-3 text-foreground">Website content</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          Photos, credentials and videos that support the public website. Hero banners, offers and articles have their own
          dedicated modules so nothing is stored twice.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5 rounded-xl border border-border/70 bg-card p-1.5">
        {groups.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => setActive(item.type)}
            aria-pressed={active === item.type}
            className={
              "rounded-lg px-3.5 py-2 text-[12.5px] font-medium transition " +
              (active === item.type
                ? "bg-ink-950 text-white"
                : "text-muted-foreground hover:bg-secondary-50 hover:text-foreground")
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-[12.5px] text-muted-foreground">{group.description}</p>

      <ContentManagerPanel
        key={group.type}
        type={group.type}
        addLabel={group.addLabel}
        fields={group.fields}
      />
    </DashboardLayout>
  );
}
