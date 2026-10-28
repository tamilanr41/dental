import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, LoaderCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LiveChat } from "@/components/home/LiveChat";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { api, resolveApiAsset, type SiteContent } from "@/lib/api";
import { formatArticleDate, readingMinutes } from "@/lib/blog";

export default function BlogArticlePage() {
  const { slug = "" } = useParams();
  const [article, setArticle] = useState<SiteContent | null>(null);
  const [related, setRelated] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    api
      .get<{ item: SiteContent; related: SiteContent[] }>(`/api/blog/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (!active) return;
        setArticle(data.item);
        setRelated(Array.isArray(data.related) ? data.related : []);
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionTag?.getAttribute("content") ?? "";
    document.title = article.seoTitle || `${article.title} · Sri Saraswathi Dental Clinic`;
    const description = article.seoDescription || article.excerpt;
    if (description) {
      if (descriptionTag) descriptionTag.setAttribute("content", description);
      else {
        const tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        tag.setAttribute("content", description);
        document.head.appendChild(tag);
      }
    }
    return () => {
      document.title = previousTitle;
      if (descriptionTag) descriptionTag.setAttribute("content", previousDescription);
    };
  }, [article]);

  const minutes = useMemo(() => (article ? readingMinutes(article.body) : 1), [article]);

  if (loading) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#fbfaf6]">
        <LoaderCircle className="h-7 w-7 animate-spin text-primary-700" />
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="min-h-screen bg-[#fbfaf6] pt-36 pb-24">
        <div className="container-x">
          <div className="mx-auto max-w-lg rounded-3xl border border-border/70 bg-card px-6 py-14 text-center shadow-soft">
            <h1 className="font-display text-3xl font-medium text-foreground">Article not available</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This article may have been unpublished or the link is incorrect.
            </p>
            <Button asChild className="mt-6">
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4" /> Back to the journal
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#fbfaf6]">
        <article>
          <header className="border-b border-border/60 bg-gradient-to-b from-secondary-50/80 via-[#fbfaf6] to-[#fbfaf6] pt-32 pb-12 md:pt-36">
            <div className="container-x">
              <div className="mx-auto max-w-3xl">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-primary-800"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to the journal
                </Link>
                <p className="mt-6 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary-700">
                  {article.category || "Dental care"}
                </p>
                <h1 className="mt-3 font-display text-[34px] leading-[1.15] tracking-tight text-foreground md:text-[46px]">
                  {article.title}
                </h1>
                {article.excerpt && (
                  <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">{article.excerpt}</p>
                )}
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5" /> {article.author || "Sri Saraswathi Dental Clinic"}
                  </span>
                  {article.publishedAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatArticleDate(article.publishedAt)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" /> {minutes} min read
                  </span>
                </div>
              </div>
            </div>
          </header>

          {article.mediaUrl && (
            <div className="container-x -mt-2 pt-8">
              <div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-soft">
                <img
                  src={resolveApiAsset(article.mediaUrl)}
                  alt={article.title}
                  loading="eager"
                  decoding="async"
                  className="max-h-[520px] w-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="container-x py-12 md:py-16">
            <div className="mx-auto max-w-[68ch]">
              {article.body ? (
                <ArticleBody body={article.body} />
              ) : (
                <p className="text-[16px] leading-relaxed text-muted-foreground">This article will be updated shortly.</p>
              )}

              <div className="mt-14 rounded-[26px] border border-ink-950/10 bg-ink-950 px-6 py-8 text-white md:px-9">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/50">Next step</p>
                <h2 className="mt-3 font-display text-[26px] leading-tight">Have a question about your own smile?</h2>
                <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-white/60">
                  Book a visit with Dr. Dinesh Kumar at Sri Saraswathi Dental Clinic, Erode — or call the clinic and we
                  will help you choose the right appointment.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild className="bg-white text-ink-950 hover:bg-primary-50">
                    <Link to="/booking">
                      Book an appointment <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <a
                    href="tel:+914244272494"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
                  >
                    Call 0424 427 2494
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-border/60 pb-20">
            <div className="container-x pt-12">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-[26px] font-medium tracking-tight text-foreground">More from the clinic</h2>
                <Link to="/blog" className="text-[12.5px] font-semibold text-primary-800 hover:text-primary-950">
                  View all articles
                </Link>
              </div>
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-[22px] border border-border/70 bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <Link to={`/blog/${item.slug}`}>
                      {item.mediaUrl ? (
                        <img
                          src={resolveApiAsset(item.mediaUrl)}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50" />
                      )}
                      <div className="p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-700">
                          {item.category || "Dental care"}
                        </p>
                        <h3 className="mt-2 font-display text-[19px] leading-snug text-foreground">{item.title}</h3>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <LiveChat />
    </>
  );
}
