import { Link } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Phone,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/home/CTASection";
import { LiveChat } from "@/components/home/LiveChat";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

interface ServicePageProps {
  title: string;
  description: string;
  overview: string;
  benefits: string[];
  procedureSteps: { title: string; description: string }[];
  estimatedDuration: string;
  recoveryGuidance: string[];
  faqs: { question: string; answer: string }[];
  priceRange?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function ServiceTemplate({
  title,
  description,
  overview,
  benefits,
  procedureSteps,
  estimatedDuration,
  recoveryGuidance,
  faqs,
  priceRange,
  imageUrl,
  imageAlt,
}: ServicePageProps) {
  return (
    <>
      <main className="min-h-screen bg-background">
        <PageHero
          eyebrow={`Treatments · ${title}`}
          title={
            <>
              {title}, <span className="italic text-primary-700">thoughtfully done.</span>
            </>
          }
          description={description}
          actions={
            <>
              <Button asChild size="lg">
                <Link to="/booking">
                  <Calendar className="h-4 w-4" /> Book this treatment
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={`/booking?service=${encodeURIComponent(title)}`}>
                  Free consultation
                </Link>
              </Button>
            </>
          }
          aside={
            <div className="relative overflow-hidden rounded-[26px] border border-border/70 bg-secondary-100 shadow-lift">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={imageAlt ?? "Dental care at Sri Saraswathi Dental Clinic"}
                    width={1200}
                    height={900}
                    fetchPriority="high"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5 text-primary-200" />
                      {estimatedDuration}
                    </div>
                    {priceRange && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">
                          From
                        </p>
                        <p className="font-display text-lg text-white">{priceRange}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                  <Sparkles className="h-14 w-14 text-primary-400" />
                </div>
              )}
            </div>
          }
        />

        {/* Overview + quick info */}
        <section className="section-pad">
          <div className="container-x">
            <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
              <div>
                <ScrollReveal>
                  <span className="eyebrow">
                    <span className="eyebrow-dot" /> Treatment overview
                  </span>
                  <h2 className="mt-5 text-display-3 text-balance">
                    What to expect, before you decide
                  </h2>
                  <p className="mt-5 text-pretty text-[16px] leading-relaxed text-muted-foreground">
                    {overview}
                  </p>
                </ScrollReveal>

                <div className="mt-10">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Benefits
                  </h3>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card px-4 py-3"
                      >
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                        <span className="text-[13px] leading-relaxed text-foreground/80">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="lg:sticky lg:top-32 lg:self-start">
                <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Quick info
                  </p>
                  <div className="mt-5 space-y-4">
                    {[
                      { icon: Clock, label: "Duration", value: estimatedDuration },
                      { icon: Shield, label: "Safety", value: "AI-assisted precision" },
                      { icon: Star, label: "Satisfaction", value: "4.9 / 5 patient rating" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                          <row.icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[12px] font-medium text-foreground">{row.label}</p>
                          <p className="text-[12px] text-muted-foreground">{row.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {priceRange && (
                    <div className="mt-5 border-t border-border/70 pt-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        Starting from
                      </p>
                      <p className="font-display text-2xl font-medium text-primary-700">
                        {priceRange}
                      </p>
                    </div>
                  )}

                  <Button asChild fullWidth className="mt-6">
                    <Link to="/booking">Book appointment</Link>
                  </Button>
                  <Button asChild fullWidth variant="ghost" className="mt-1">
                    <a href="tel:+1234567890">
                      <Phone className="h-4 w-4" /> Ask a question
                    </a>
                  </Button>

                  <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
                    Insurance verified before your visit. Free rescheduling up to 24h.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Procedure steps */}
        <section className="section-pad border-y border-border/60 bg-secondary-50/60">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> The process
                </span>
                <h2 className="mt-5 text-display-3 text-balance">
                  Step by step, <span className="italic text-primary-700">no surprises</span>
                </h2>
              </div>
              <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                Every stage is explained before it happens — and you can pause at any point.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {procedureSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="group rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 font-display text-[13px] text-white">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-border transition-colors group-hover:text-primary-500" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recovery + FAQs */}
        <section className="section-pad">
          <div className="container-x">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> Aftercare
                </span>
                <h2 className="mt-5 text-display-3">Recovery guidance</h2>
                <div className="mt-6 space-y-2.5">
                  {recoveryGuidance.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5"
                    >
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                      <span className="text-[13px] leading-relaxed text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> Common questions
                </span>
                <h2 className="mt-5 text-display-3">Good to know</h2>
                <div className="mt-6 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card">
                  {faqs.map((faq, idx) => (
                    <details key={idx} className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[14px] font-medium text-foreground transition-colors hover:bg-secondary-50/60 [&::-webkit-details-marker]:hidden">
                        {faq.question}
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                      </summary>
                      <p className="px-5 pb-4 pr-10 text-[13px] leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <LiveChat />
    </>
  );
}
