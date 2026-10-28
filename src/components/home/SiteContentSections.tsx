import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, BadgeCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api, resolveApiAsset, type SiteContent, type SiteContentType } from "@/lib/api";
import { SectionHeading } from "@/components/ui/SectionHeading";

type SiteContentState = { items: SiteContent[]; loading: boolean };
const SiteContentContext = createContext<SiteContentState>({ items: [], loading: true });

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get<{ items: SiteContent[] }>("/api/content")
      .then((data) => {
        if (active) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ items, loading }), [items, loading]);
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(type?: SiteContentType) {
  const content = useContext(SiteContentContext);
  const items = type ? content.items.filter((item) => item.type === type) : content.items;
  return { items, loading: content.loading };
}

function ContentLink({ item, children, className }: { item: SiteContent; children: ReactNode; className: string }) {
  if (!item.linkUrl) return <div className={className}>{children}</div>;
  if (/^https:\/\//i.test(item.linkUrl)) {
    return <a className={className} href={item.linkUrl} target="_blank" rel="noreferrer">{children}</a>;
  }
  return <Link className={className} to={item.linkUrl}>{children}</Link>;
}

const sectionInfo: Record<"blog" | "offer" | "badge", { eyebrow: string; title: string; description: string }> = {
  blog: {
    eyebrow: "From the clinic",
    title: "A little more to know about your smile.",
    description: "Helpful notes and updates from the Sri Saraswathi Dental Clinic team.",
  },
  offer: {
    eyebrow: "Clinic offers",
    title: "A brighter smile can start today.",
    description: "Explore current treatments and offers from our clinic.",
  },
  badge: {
    eyebrow: "Our credentials",
    title: "Care you can feel confident about.",
    description: "The standards, training and recognitions our team is proud to share.",
  },
};

export function ManagedContentSection({ type }: { type: "blog" | "offer" | "badge" }) {
  const { items, loading } = useSiteContent(type);
  if (loading || !items.length) return null;
  const sortedItems = [...items].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return b.id - a.id;
  });
  const info = sectionInfo[type];

  if (type === "badge") {
    return (
      <section className="section-pad relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-primary-500/20 blur-[120px]" />
          <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-accent-400/15 blur-[140px]" />
        </div>
        <div className="container-x relative">
          <div className="max-w-2xl">
            <p className="eyebrow text-white/60"><span className="eyebrow-dot" />{info.eyebrow}</p>
            <h2 className="mt-4 text-display-2 text-balance text-white">{info.title}</h2>
            <p className="mt-4 text-pretty text-[16px] leading-relaxed text-white/60">{info.description}</p>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sortedItems.map((item) => (
              <article key={item.id} className="flex min-h-28 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.09]">
                {item.mediaUrl ? (
                  <img src={resolveApiAsset(item.mediaUrl)} alt="" loading="lazy" decoding="async" className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1.5" />
                ) : (
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-accent-300"><BadgeCheck className="h-5 w-5" /></span>
                )}
                <div className="min-w-0">
                  {item.badgeText && <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-accent-200">{item.badgeText}</p>}
                  <h3 className="mt-1 font-display text-base leading-tight text-white">{item.title}</h3>
                  {item.subtitle && <p className="mt-1 text-xs leading-relaxed text-white/55">{item.subtitle}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={"section-pad relative overflow-hidden " + (type === "offer" ? "bg-gradient-to-b from-primary-50/70 via-background to-background" : "bg-background")}>
      <div className="container-x relative">
        <SectionHeading align="center" eyebrow={info.eyebrow} title={<>{info.title}</>} description={info.description} />
        <div className={"mx-auto mt-11 grid max-w-6xl gap-5 " + (type === "blog" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2")}>
          {sortedItems.map((item) => (
            <ContentLink key={item.id} item={item} className="group block overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              {item.mediaUrl && <img src={resolveApiAsset(item.mediaUrl)} alt={item.title} loading="lazy" decoding="async" className={"w-full object-cover " + (type === "offer" ? "aspect-[2/1]" : "aspect-[1.7/1]")} />}
              <div className="p-5 md:p-6">
                {item.badgeText && <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-800"><Sparkles className="h-3 w-3" />{item.badgeText}</span>}
                <h3 className="mt-3 font-display text-xl font-medium tracking-tight text-foreground">{item.title}</h3>
                {item.subtitle && <p className="mt-1.5 text-sm font-medium text-primary-800">{item.subtitle}</p>}
                {item.body && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{item.body}</p>}
                {item.linkUrl && <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary-800">Learn more <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>}
              </div>
            </ContentLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ManagedMediaSection() {
  const { items, loading } = useSiteContent();
  const media = items.filter((item) => ["reel", "video", "image"].includes(item.type) && item.mediaUrl);
  if (loading || !media.length) return null;

  return (
    <section className="section-pad relative overflow-hidden bg-secondary-50/60">
      <div className="container-x relative">
        <SectionHeading
          align="center"
          eyebrow="Inside the clinic"
          title={<>Small moments, <span className="italic text-primary-700">real smiles.</span></>}
          description="See the people, care and moments behind every visit."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {media.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-[22px] border border-border/70 bg-card shadow-soft">
              <div className={"relative overflow-hidden bg-ink-950/5 " + (item.type === "reel" ? "aspect-[9/13]" : "aspect-[4/3]")}>
                {item.type === "image" ? (
                  <img src={resolveApiAsset(item.mediaUrl)} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
                ) : (
                  <video src={resolveApiAsset(item.mediaUrl)} controls playsInline preload="metadata" className="h-full w-full object-cover" />
                )}
                {item.badgeText && <span className="absolute left-3 top-3 rounded-full bg-ink-950/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">{item.badgeText}</span>}
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-medium text-foreground">{item.title}</h3>
                {item.subtitle && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.subtitle}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}