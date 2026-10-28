import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Globe,
  Heart,
  Microscope,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CTASection } from "@/components/home/CTASection";
import { LiveChat } from "@/components/home/LiveChat";
import { Button } from "@/components/ui/Button";
import { clinicImages } from "@/lib/images";

const values = [
  {
    icon: Shield,
    title: "AI-powered precision",
    desc: "Machine-assisted diagnostics and treatment planning that catch what the eye can miss.",
  },
  {
    icon: Heart,
    title: "Patient-centred care",
    desc: "Every plan is built around your comfort, your budget, and your pace — never a template.",
  },
  {
    icon: Microscope,
    title: "Advanced technology",
    desc: "Digital scanners, 3D imaging and CAD/CAM milling, all under one quiet roof.",
  },
  {
    icon: Users,
    title: "A specialist team",
    desc: "Board-certified clinicians across orthodontics, implantology, endodontics and more.",
  },
  {
    icon: Zap,
    title: "Efficiency by design",
    desc: "Smart scheduling, same-day treatments and follow-ups that arrive before you ask.",
  },
  {
    icon: Globe,
    title: "Accessible by default",
    desc: "Multi-language support, insurance-friendly billing and flexible payment plans.",
  },
];

const timeline = [
  { year: "2014", event: "Sri Saraswathi Dental Clinic opens in Erode with one belief: dentistry can feel calm." },
  { year: "2016", event: "Grows into a multi-specialty practice, adding orthodontics and implantology." },
  { year: "2018", event: "Goes fully digital with intraoral scanning and same-day ceramic crowns." },
  { year: "2020", event: "Launches tele-dentistry and the patient portal, keeping care close from home." },
  { year: "2023", event: "Introduces AI-assisted diagnostics and predictive treatment planning." },
  { year: "2024", event: "Opens a second location and puts a voice assistant beside every clinician." },
  { year: "2025", event: "Unifies clinical and administrative workflows around one AI platform." },
  { year: "2026", event: "Now a leading dental AI platform — 50,000 smiles and counting." },
];

const stats = [
  { value: "25+", label: "Years of practice" },
  { value: "50k+", label: "Patients cared for" },
  { value: "12", label: "Specialists on staff" },
  { value: "4.9", label: "Average patient rating" },
];

export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <PageHero
          eyebrow="Our practice"
          title={
            <>
              Dentistry, designed <span className="italic text-primary-700">around people.</span>
            </>
          }
          description="Advanced technology meets unhurried, human care. We rebuilt the dental visit from the waiting room outward — and we've been refining it for over two decades."
          actions={
            <>
              <Button asChild size="lg">
                <Link to="/booking">
                  Book a visit <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dentists">Meet the team</Link>
              </Button>
            </>
          }
          aside={
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-card backdrop-blur md:p-8">
              <div className="grid grid-cols-2 gap-y-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-4xl font-medium tracking-tight text-foreground">
                      {s.value}
                    </p>
                    <p className="mt-1.5 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-2 border-t border-border/70 pt-5 text-[12px] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Independently owned since 2014
              </div>
            </div>
          }
        />

        {/* Mission */}
        <section className="section-pad">
          <div className="container-x">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <ScrollReveal>
                <div>
                  <span className="eyebrow">
                    <span className="eyebrow-dot" /> Our mission
                  </span>
                  <h2 className="mt-5 text-display-2 text-balance">
                    Make extraordinary care feel <span className="italic text-primary-700">ordinary.</span>
                  </h2>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div>
                  <p className="text-pretty text-[17px] leading-relaxed text-muted-foreground">
                    We believe a healthy smile shouldn&apos;t require nerves, guesswork or a day off
                    work. So we use the best technology available — AI triage, digital scans,
                    same-day ceramics — to remove everything that makes dentistry feel clinical,
                    and give that time back to you.
                  </p>
                  <p className="mt-5 text-pretty text-[17px] leading-relaxed text-muted-foreground">
                    The result is a practice that feels less like a clinic and more like a studio:
                    quiet rooms, natural light, clear pricing, and clinicians who explain before
                    they act.
                  </p>
                  <div className="mt-8 flex items-center gap-4 border-t border-border/70 pt-6">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-secondary-100 shadow-card ring-4 ring-white">
                      <img
                        src={clinicImages.dentistPortrait}
                        alt="Dentist at Sri Saraswathi Dental Clinic"
                        width={900}
                        height={1200}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <p className="font-display text-lg font-medium text-foreground">Dr. Dinesh Kumar</p>
                      <p className="text-[13px] text-muted-foreground">Founder & Chief Dental Surgeon</p>
                    </div>
                  </div>
                  <figure className="mt-7 overflow-hidden rounded-[22px] border border-border/70 bg-card shadow-soft">
                    <img
                      src={clinicImages.waitingCorridor}
                      alt="Waiting corridor leading to the dental treatment rooms"
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/7] w-full object-cover"
                    />
                    <figcaption className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Inside the practice · Erode
                    </figcaption>
                  </figure>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-pad border-y border-border/60 bg-secondary-50/60">
          <div className="container-x">
            <ScrollReveal>
              <div className="max-w-2xl">
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> What sets us apart
                </span>
                <h2 className="mt-5 text-display-2 text-balance">
                  Six things we refuse to <span className="italic text-primary-700">compromise</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section-pad">
          <div className="container-x">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
              <ScrollReveal>
                <div className="lg:sticky lg:top-32">
                  <span className="eyebrow">
                    <span className="eyebrow-dot" /> Our journey
                  </span>
                  <h2 className="mt-5 text-display-2 text-balance">
                    Twelve years of <span className="italic text-primary-700">quiet progress</span>
                  </h2>
                  <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                    No pivots, no shortcuts — just steady investment in the people and tools that
                    make a visit feel effortless.
                  </p>
                </div>
              </ScrollReveal>

              <ol className="relative space-y-2 border-l border-border pl-8 md:pl-12">
                {timeline.map((item, i) => (
                  <motion.li
                    key={item.year}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.25) }}
                    className="group relative rounded-xl px-4 py-4 transition-colors hover:bg-secondary-50/70"
                  >
                    <span className="absolute -left-[41px] top-6 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary-600 bg-background transition-colors group-hover:bg-primary-600 md:-left-[57px]" />
                    <p className="font-display text-sm font-medium tracking-wider text-primary-700">
                      {item.year}
                    </p>
                    <p className="mt-1 text-pretty text-[15px] leading-relaxed text-foreground/80">
                      {item.event}
                    </p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <LiveChat />
    </>
  );
}
