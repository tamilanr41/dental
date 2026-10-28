"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerGrid } from "@/components/animations/StaggerGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRight, Sparkles, Scan, Syringe, Baby, Heart, Smile, Pill, Bone, Wrench, Gem, Brush, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { serviceImages } from "@/lib/images";

interface ServiceProps {
  icon: any;
  label: string;
  href: string;
  description: string;
  details: string;
  beforeAfter: string;
}

const services: ServiceProps[] = [
  { icon: Activity, label: "General Dentistry", href: "/services/general-dentistry", description: "Comprehensive exams, cleanings & preventive care", details: "Our AI-enhanced checkups detect issues months earlier than traditional exams. Includes digital X-rays, oral cancer screening, and personalized hygiene plans.", beforeAfter: serviceImages["general-dentistry"] },
  { icon: Sparkles, label: "Cosmetic Dentistry", href: "/services/cosmetic-dentistry", description: "Transform your smile with precision artistry", details: "AI smile simulation lets you preview results before treatment begins. From veneers to bonding, every procedure is digitally planned to perfection.", beforeAfter: serviceImages["cosmetic-dentistry"] },
  { icon: Brush, label: "Teeth Whitening", href: "/services/teeth-whitening", description: "Professional whitening, dramatically brighter", details: "Our AI-powered shade analysis predicts your final result. In-office treatment takes 60 minutes with results lasting 12+ months.", beforeAfter: serviceImages["teeth-whitening"] },
  { icon: Bone, label: "Dental Implants", href: "/services/dental-implants", description: "Permanent replacement that looks and feels natural", details: "AI-guided implant placement ensures 99.3% success rate. Same-day crowns available with our digital workflow.", beforeAfter: serviceImages["dental-implants"] },
  { icon: Smile, label: "Orthodontics", href: "/services/orthodontics", description: "Straighter teeth, confidently yours", details: "AI treatment planning predicts tooth movement with weekly progress tracking. Invisalign and traditional braces available.", beforeAfter: serviceImages["orthodontics"] },
  { icon: Syringe, label: "Root Canal", href: "/services/root-canal", description: "Pain-free relief with microscopic precision", details: "GentleWave technology cleans 99% of root canal surfaces. AI-assisted diagnosis identifies issues traditional X-rays miss.", beforeAfter: serviceImages["root-canal"] },
  { icon: Baby, label: "Pediatric Dentistry", href: "/services/pediatric-dentistry", description: "Gentle care for growing smiles", details: "Child-friendly environment with AI-powered cavity detection. Digital scanners replace uncomfortable molds.", beforeAfter: serviceImages["pediatric-dentistry"] },
  { icon: Heart, label: "Gum Treatment", href: "/services/gum-treatment", description: "Healthy gums, healthy life", details: "Laser therapy with AI-guided precision targeting. Non-invasive treatment with faster recovery times.", beforeAfter: serviceImages["gum-treatment"] },
  { icon: Scan, label: "Wisdom Tooth", href: "/services/wisdom-tooth", description: "Smart extraction with faster recovery", details: "3D CBCT scan guides precise extraction planning. AI predicts nerve proximity for maximum safety.", beforeAfter: serviceImages["wisdom-tooth"] },
  { icon: Wrench, label: "Crowns & Bridges", href: "/services/crowns-bridges", description: "Same-day restoration with digital precision", details: "CEREC technology creates custom crowns in a single visit. AI color-matching ensures natural blend with adjacent teeth.", beforeAfter: serviceImages["crowns-bridges"] },
  { icon: Gem, label: "Veneers", href: "/services/veneers", description: "Flawless smile, instantly transformed", details: "AI smile design creates your perfect shape, size, and shade. Ultra-thin porcelain with zero-prep options available.", beforeAfter: serviceImages["veneers"] },
  { icon: Pill, label: "Dentures", href: "/services/dentures", description: "Modern fit, natural feel, confident smile", details: "3D-printed precision dentures with AI-optimized fit. Digital impressions eliminate gagging and discomfort.", beforeAfter: serviceImages["dentures"] },
];

export function ServicesOverview() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="section-pad relative overflow-hidden bg-background">
      <div className="container-x">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Comprehensive care"
            title={
              <>
                Every smile deserves
                <br className="hidden sm:block" /> the <span className="italic text-primary-700">right</span> treatment.
              </>
            }
            description="Twelve specialities, one calm experience. Tap a treatment to see how AI sharpens every step — from diagnosis to aftercare."
            action={
              <Link
                to="/booking"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground/75 transition-all hover:border-foreground/20 hover:text-foreground"
              >
                Not sure where to start?
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
        </ScrollReveal>

        <StaggerGrid className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isExpanded = expanded === service.label;

            return (
              <motion.div
                key={service.label}
                layout
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-2xl border bg-card transition-all duration-300",
                  isExpanded
                    ? "border-primary-300 shadow-card"
                    : "border-border/80 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card"
                )}
                onClick={() => setExpanded(isExpanded ? null : service.label)}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50/0 via-transparent to-primary-50/0 opacity-0 transition-opacity duration-300 group-hover:from-primary-50/60 group-hover:to-transparent group-hover:opacity-100" />

                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-300",
                        isExpanded
                          ? "bg-primary text-primary-foreground ring-primary-700"
                          : "bg-primary-50 text-primary-700 ring-primary-600/10 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary-700"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-[19px] leading-tight text-foreground">
                    {service.label}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-primary-700">
                    {isExpanded ? "Close" : "Explore"}
                    <ArrowRight
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300",
                        isExpanded ? "-rotate-90" : "group-hover:translate-x-1"
                      )}
                    />
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="relative overflow-hidden"
                    >
                      <div className="mx-5 space-y-4 border-t border-border/70 pb-5 pt-4">
                        <p className="text-[13px] leading-relaxed text-secondary-600">{service.details}</p>
                        <img
                          src={service.beforeAfter}
                          alt={service.label}
                          width={600}
                          height={300}
                          loading="eager"
                          decoding="async"
                          className="h-32 w-full rounded-xl object-cover"
                        />
                        <Link
                          to={service.href}
                          className="inline-flex items-center gap-1.5 rounded-full bg-ink-950 px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-ink-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Full treatment guide
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </StaggerGrid>
      </div>
    </section>
  );
}
