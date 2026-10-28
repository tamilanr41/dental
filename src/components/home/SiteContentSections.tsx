import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, BadgeCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api, resolveApiAsset, type SiteContent, type SiteContentType } from "@/lib/api";
import { formatArticleDate } from "@/lib/blog";
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
      <section className="section-pad relative overflow-hidden bg-gradient-to-b from-[#f7f7f2] via-background to-[#f2f5f3]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-accent-100/70 blur-[110px]" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-primary-100/70 blur-[120px]" />
        </div>
        <div className="container-x relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center"><span className="eyebrow-dot" />{info.eyebrow}</p>
            <h2 className="mt-4 text-display-2 text-balance text-foreground">{info.title}</h2>
            <p className="mt-4 text-pretty text-[16px] leading-relaxed text-muted-foreground">{info.description}</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sortedItems.map((item) => (
              <article key={item.id} className="group relative flex min-h-64 flex-col items-center overflow-hidden rounded-[28px] border border-accent-200/70 bg-gradient-to-br from-white via-[#fffefa] to-[#f5f0df] px-5 py-7 text-center shadow-soft transition duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-lift">
                <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-700 via-accent-400 to-primary-700" />
                <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-accent-100/80 transition-transform duration-500 group-hover:scale-125" />
                <span className="relative grid h-[82px] w-[82px] shrink-0 place-items-center rounded-full border border-accent-300 bg-white p-3 shadow-card ring-4 ring-accent-50">
                  {item.mediaUrl ? (
                    <img src={resolveApiAsset(item.mediaUrl)} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                  ) : (
                    <BadgeCheck className="h-9 w-9 text-primary-700" strokeWidth={1.5} />
                  )}
                </span>
                <span className="mt-5 inline-flex rounded-full border border-accent-200 bg-accent-50/80 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-accent-800">
                  {item.badgeText || "Clinic credential"}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold leading-tight tracking-tight text-foreground">{item.title}</h3>
                {item.subtitle && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.subtitle}</p>}
                <span className="mt-auto flex w-full items-center gap-2 pt-5 text-accent-700/70">
                  <span className="h-px flex-1 bg-accent-200/70" />
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="h-px flex-1 bg-accent-200/70" />
                </span>
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
        <SectionHeading
          align={type === "blog" ? "left" : "center"}
          eyebrow={info.eyebrow}
          title={<>{info.title}</>}
          description={info.description}
          action={
            type === "blog" ? (
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary-800 transition-colors hover:text-primary-950">
                View all articles <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : undefined
          }
        />
        <div className={"mt-11 grid max-w-6xl gap-5 " + (type === "blog" ? "sm:grid-cols-2 lg:grid-cols-3" : "mx-auto md:grid-cols-2")}>
          {sortedItems.map((item) =>
            type === "blog" ? (
              <article key={item.id} className="group flex flex-col overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-soft transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift">
                <Link to={`/blog/${item.slug}`} className="block overflow-hidden">
                  {item.mediaUrl ? (
                    <img
                      src={resolveApiAsset(item.mediaUrl)}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="aspect-[16/10] w-full bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-primary-700">
                    {item.category || "Dental care"}
                  </p>
                  <h3 className="mt-2 font-display text-[19px] leading-snug tracking-tight text-foreground">
                    <Link to={`/blog/${item.slug}`} className="transition-colors hover:text-primary-800">{item.title}</Link>
                  </h3>
                  {(item.excerpt || item.body) && (
                    <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">{item.excerpt || item.body}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="text-[11px] text-muted-foreground">{formatArticleDate(item.publishedAt)}</span>
                    <Link to={`/blog/${item.slug}`} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary-800">
                      Read article <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ) : (
              <ContentLink key={item.id} item={item} className="group block overflow-hidden rounded-[26px] border border-border/70 bg-card shadow-soft transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift">
                {item.mediaUrl && (
                  <div className="relative overflow-hidden">
                    <img src={resolveApiAsset(item.mediaUrl)} alt={item.title} loading="lazy" decoding="async" className="aspect-[1.7/1] w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
                  </div>
                )}
                <div className="relative p-5 md:p-6">
                  {item.badgeText && (
                    <span className="inline-flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-primary-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> {item.badgeText}
                    </span>
                  )}
                  <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-foreground">{item.title}</h3>
                  {item.subtitle && <p className="mt-1.5 text-sm font-medium text-primary-800">{item.subtitle}</p>}
                  {item.body && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{item.body}</p>}
                  {item.linkUrl && (
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary-800">
                      {item.ctaLabel || "Learn more"} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  )}
                </div>
              </ContentLink>
            ),
          )}
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