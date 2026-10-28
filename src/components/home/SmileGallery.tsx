import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSiteContent } from "@/components/home/SiteContentSections";
import { resolveApiAsset } from "@/lib/api";

export function SmileGallery() {
  const { items, loading } = useSiteContent("gallery");
  const entries = [...items]
    .filter((item) => item.beforeImage && item.afterImage)
    .sort((a, b) => (a.displayOrder !== b.displayOrder ? a.displayOrder - b.displayOrder : b.id - a.id));

  if (loading || !entries.length) return null;

  return (
    <section className="section-pad relative overflow-hidden bg-background">
      <div className="container-x relative">
        <SectionHeading
          align="center"
          eyebrow="Smile gallery"
          title={<>Real smiles, <span className="italic text-primary-700">real transformations.</span></>}
          description="Before-and-after results from treatments at the clinic. Every photo is shared with the patient's consent."
          action={
            <Link
              to="/booking"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary-800 transition-colors hover:text-primary-950"
            >
              Book a consultation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="mx-auto mt-11 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-[24px] border border-border/70 bg-card p-3 shadow-soft">
              <BeforeAfterSlider
                beforeImage={resolveApiAsset(item.beforeImage)}
                afterImage={resolveApiAsset(item.afterImage)}
                alt={item.title || "Dental transformation before and after"}
              />
              <figcaption className="px-2 pb-1 pt-4">
                {item.badgeText && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-700">
                    {item.badgeText}
                  </p>
                )}
                <p className="mt-1.5 font-display text-[17px] leading-snug text-foreground">{item.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
