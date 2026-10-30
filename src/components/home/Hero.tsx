"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Play, Sparkles, Shield, Star, Bot, CalendarCheck, Check } from "lucide-react";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { NumberTicker } from "@/components/animations/NumberTicker";
import { clinicImages } from "@/lib/images";
import { useSiteContent } from "@/components/home/SiteContentSections";
import { resolveApiAsset } from "@/lib/api";

function FloatingElement({
  children,
  amplitude = 12,
  duration = 4,
  delay = 0,
}: {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
}) {
  const { isLowEnd } = useDeviceDetect();
  const style = {
    "--float-amplitude": `${amplitude}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  } as React.CSSProperties;

  return <div className={isLowEnd ? undefined : "animate-clinic-float"} style={style}>{children}</div>;
}

function FloatingOrbit({ children, radius, duration, delay = 0 }: { children: React.ReactNode; radius: number; duration: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { isLowEnd } = useDeviceDetect();

  useEffect(() => {
    if (isLowEnd || !ref.current) return;
    const el = ref.current;
    let start: number | null = null;
    let animId: number;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const t = ((timestamp - start) / 1000) * (1 / duration) * Math.PI * 2 + delay;
      el.style.transform = `translate(${radius * Math.cos(t)}px, ${radius * Math.sin(t)}px)`;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [radius, duration, delay, isLowEnd]);

  return <div ref={ref} className="pointer-events-none absolute">{children}</div>;
}

const heroStats = [
  { value: 50000, suffix: "+", label: "Patients treated" },
  { value: 25, suffix: "+", label: "Years of care" },
  { value: 4.9, suffix: "", label: "Average rating", decimals: 1 },
  { value: 98, suffix: "%", label: "Would return" },
];

const defaultHeroSlides = [
  {
    image: clinicImages.heroDentalCare,
    alt: "Dentist providing a careful dental check-up",
    eyebrow: "Clinical care",
    badge: "Care that feels calm",
    caption: "Thoughtful treatment · Erode",
  },
  {
    image: clinicImages.dentistHero,
    alt: "Dr. Kishore Kumar at Sri Saraswathi Dental Clinic",
    eyebrow: "Meet your dentist",
    badge: "Care led by experience",
    caption: "Dr. Kishore Kumar · Erode",
  },
  {
    image: clinicImages.operatoryChair,
    alt: "Modern dental treatment room at Sri Saraswathi Dental Clinic",
    eyebrow: "Inside the clinic",
    badge: "Modern dental care",
    caption: "Sri Saraswathi Dental Clinic · Erode",
  },
] as const;
export function Hero() {
  const { isLowEnd } = useDeviceDetect();
  const { items: heroBanners } = useSiteContent("hero");
  const sortedHeroBanners = [...heroBanners].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.id - b.id;
  });
  const usesAdminHeroBanners = sortedHeroBanners.length > 0;
  const heroSlideCount = usesAdminHeroBanners ? sortedHeroBanners.length + 1 : defaultHeroSlides.length;
  const [heroBannerIndex, setHeroBannerIndex] = useState(0);
  useEffect(() => {
    setHeroBannerIndex(0);
    if (heroSlideCount < 2) return;
    const timer = window.setInterval(() => {
      setHeroBannerIndex((index) => (index + 1) % heroSlideCount);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [heroSlideCount]);
  const heroBanner = usesAdminHeroBanners && heroBannerIndex > 0 ? sortedHeroBanners[heroBannerIndex - 1] : null;
  const defaultHeroSlide = defaultHeroSlides[usesAdminHeroBanners ? 0 : heroBannerIndex] ?? defaultHeroSlides[0];
  const heroCtaLabel = heroBanner?.ctaLabel || "Book in 60 seconds";
  const heroCtaHref = heroBanner?.linkUrl || "/booking";
  const heroCtaIsExternal = /^https:\/\//i.test(heroCtaHref);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setIsNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bgX = useTransform(mouseX, [-1, 1], [-14, 14]);
  const bgY = useTransform(mouseY, [-1, 1], [-14, 14]);
  const imageX = useTransform(mouseX, [-1, 1], [-8, 8]);
  const imageY = useTransform(mouseY, [-1, 1], [-8, 8]);

  useEffect(() => {
    if (isLowEnd) return;
    const handle = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, [mouseX, mouseY, isLowEnd]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="relative overflow-hidden pt-28 md:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-50 via-background to-background" />
        <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0">
          <div className="absolute -left-44 -top-40 h-[560px] w-[560px] rounded-full bg-primary-200/45 blur-[130px]" />
          <div className="absolute -right-32 top-24 h-[460px] w-[460px] rounded-full bg-accent-200/35 blur-[130px]" />
          <div className="absolute bottom-0 left-1/3 h-[280px] w-[280px] rounded-full bg-primary-100/60 blur-[100px]" />
        </motion.div>
        <div className="absolute inset-0 bg-grid opacity-[0.45] mask-fade-b" />
        <div className="grain absolute inset-0 opacity-[0.045]" />
      </div>

      <div className="container-x grid items-center gap-14 pb-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16 lg:pb-24">
        <motion.div variants={containerVariants} initial={false} animate="visible" className="relative z-10">
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-gradient-to-r from-primary-50/90 to-white py-1.5 pl-1.5 pr-4 text-[12px] font-medium text-foreground/80 shadow-[0_10px_40px_-20px_rgba(18,56,72,0.9)] backdrop-blur">
              <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-ink-950 via-primary-800 to-ink-950 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_-18px_rgba(255,255,255,0.9)]">
                <Sparkles className="h-3 w-3 animate-pulse text-accent-300" />
                {heroBanner?.badgeText || "Featured"}
              </span>
              <span className="line-clamp-1">{heroBanner ? (heroBanner.subtitle || heroBanner.title || "Precision dental care reimagined") : "AI dental operating system"}</span>
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="mt-7 text-display-1 text-balance text-foreground">
            {heroBanner ? (
              <>
                <span className="whitespace-pre-line">{heroBanner.title}</span>
                {heroBanner.subtitle && <><br /><span className="italic text-primary-700">{heroBanner.subtitle}</span></>}
              </>
            ) : (
              <>
                Your smile,
                <br />
                <span className="italic text-primary-700">reimagined</span> by
                <br />
                AI &amp; expert care.
              </>
            )}
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-7 max-w-md text-pretty text-[17px] leading-relaxed text-muted-foreground">
            {heroBanner
              ? heroBanner.body || "Personalised dental care from Dr. Kishore Kumar and the Sri Saraswathi team in Erode."
              : "Book in 60 seconds, get an AI-assisted triage before you arrive, and walk out with care that feels as precise as it looks."}
          </motion.p>

          <motion.div variants={itemVariants} className="mt-9 flex flex-wrap items-center gap-3">
            {heroCtaIsExternal ? (
              <a
                href={heroCtaHref}
                target="_blank"
                rel="noreferrer"
                data-cursor={heroCtaLabel}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_18px_36px_-18px_rgba(18,56,72,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-800"
              >
                <CalendarCheck className="h-4 w-4" />
                {heroCtaLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            ) : (
              <Link
                to={heroCtaHref}
                data-cursor={heroCtaLabel}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_18px_36px_-18px_rgba(18,56,72,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-800"
              >
                <CalendarCheck className="h-4 w-4" />
                {heroCtaLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            )}
            <Link
              to="/ai-features"
              data-cursor="See AI"
              className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-card/60 px-5 py-3.5 text-sm font-medium text-foreground/75 backdrop-blur transition-all duration-300 hover:border-foreground/25 hover:text-foreground"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-950 text-white">
                <Play className="h-3 w-3 fill-current" />
              </span>
              See AI in action
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-9 flex flex-wrap items-center gap-2.5 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 shadow-soft backdrop-blur">
              <Shield className="h-3.5 w-3.5 text-primary-600" />
              Sterile &amp; safe care
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 shadow-soft backdrop-blur">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Pain-minimized dentistry
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 shadow-soft backdrop-blur">
              <span className="flex -space-x-1.5">
                {["#dbe7ec", "#e8dcc9", "#f0d9cf", "#d4e4df"].map((c, i) => (
                  <span key={i} className="h-5 w-5 rounded-full border border-background" style={{ backgroundColor: c }} />
                ))}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <strong className="font-semibold text-foreground">4.9</strong> · 2,000+ smiles
              </span>
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-11 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-border/80 pt-8 sm:grid-cols-4"
          >
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-[26px] leading-none tracking-tight text-foreground md:text-[30px]">
                  <NumberTicker
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={2}
                    decimals={stat.decimals ?? 0}
                  />
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative z-0 mx-auto w-full max-w-[520px] lg:max-w-none">
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ x: imageX, y: imageY }}
            className="relative"
          >
            <div className="absolute -inset-3 -z-10 rounded-[36px] bg-gradient-to-br from-primary-200/50 via-transparent to-accent-200/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-card shadow-lift">
              <div className="relative aspect-[4/4.6] w-full overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={heroBanner?.id ?? "clinic-default-" + heroBannerIndex}
                    src={
                      heroBanner && (heroBanner.mobileMediaUrl || heroBanner.mediaUrl)
                        ? resolveApiAsset((isNarrow && heroBanner.mobileMediaUrl) || heroBanner.mediaUrl)
                        : defaultHeroSlide.image
                    }
                    alt={heroBanner?.title || defaultHeroSlide.alt}
                    width={1024}
                    height={1178}
                    loading="eager"
                    fetchPriority={heroBannerIndex === 0 ? "high" : "auto"}
                    decoding="async"
                    initial={{ opacity: 0, scale: 1.025 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-ink-950/5 to-transparent" />

                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-3 pr-5 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">{heroBanner ? "Clinic spotlight" : defaultHeroSlide.eyebrow}</p>
                    <p className="mt-1 font-display text-lg leading-tight text-white">{heroBanner?.badgeText || defaultHeroSlide.badge}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/70">
                      <Check className="h-3 w-3 text-emerald-300" /> {heroBanner?.subtitle || defaultHeroSlide.caption}
                    </div>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-lg">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            <FloatingElement amplitude={10} duration={4.5} delay={0.4}>
              <div className="hero-float-card animate-hero-card absolute -left-4 top-8 w-[190px] rounded-2xl border border-border/70 bg-card/95 p-3.5 shadow-card backdrop-blur md:-left-10">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">AI triage ready</p>
                    <p className="text-[10px] text-muted-foreground">Symptoms analysed</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-muted-foreground">Live · 2s response</span>
                </div>
              </div>
            </FloatingElement>

            <FloatingElement amplitude={8} duration={3.8} delay={1}>
              <div className="hero-float-card animate-hero-card absolute -right-3 bottom-24 w-[168px] rounded-2xl border border-border/70 bg-card/95 p-3.5 shadow-card backdrop-blur md:-right-8">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Next opening</p>
                <p className="mt-1 font-display text-xl leading-none text-foreground">Today, 2:30</p>
                <div className="mt-2.5 space-y-1.5">
                  {["2:30 PM", "3:15 PM"].map((t, i) => (
                    <div
                      key={t}
                      className={`flex items-center justify-between rounded-lg px-2 py-1 text-[10px] ${
                        i === 0 ? "bg-primary text-white" : "bg-secondary-100 text-secondary-600"
                      }`}
                    >
                      {t}
                      <Check className={`h-3 w-3 ${i === 0 ? "text-white" : "text-secondary-400"}`} />
                    </div>
                  ))}
                </div>
              </div>
            </FloatingElement>

            {!isLowEnd && (
              <>
                <FloatingOrbit radius={230} duration={26} delay={0}>
                  <span className="block h-2.5 w-2.5 rounded-full bg-accent/50" />
                </FloatingOrbit>
                <FloatingOrbit radius={195} duration={20} delay={2}>
                  <span className="block h-2 w-2 rotate-45 bg-primary-400/50" />
                </FloatingOrbit>
              </>
            )}
          </motion.div>

          {heroSlideCount > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2.5 lg:justify-start lg:pl-2" aria-label="Hero slides">
              {Array.from({ length: heroSlideCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setHeroBannerIndex(index)}
                  aria-label={index === 0 ? "Show the clinic hero slide" : "Show added hero banner " + index}
                  aria-pressed={heroBannerIndex === index}
                  className={"h-2 rounded-full transition-all duration-300 " + (heroBannerIndex === index ? "w-7 bg-primary-700" : "w-2 bg-primary-200 hover:bg-primary-400")}
                />
              ))}
              <span className="ml-1 text-[10px] font-semibold tabular-nums text-muted-foreground">
                {String(heroBannerIndex + 1).padStart(2, "0")} / {String(heroSlideCount).padStart(2, "0")}
              </span>
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground lg:justify-start lg:pl-2">
            <span className="h-px w-8 bg-border" />
            Trusted by 2,000+ smiles
          </div>
        </div>
      </div>
    </section>
  );
}
