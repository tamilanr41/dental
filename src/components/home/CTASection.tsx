"use client";

import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ArrowRight, Calendar, MessageCircle, Phone, ShieldCheck, Clock, Star } from "lucide-react";
import { MagneticButton } from "@/components/animations/MagneticButton";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-background pb-20 pt-4 md:pb-28">
      <div className="container-x">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[36px] bg-ink-950 px-6 py-16 text-center md:px-12 md:py-20">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary-500/20 blur-[110px]" />
              <div className="absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[120px]" />
              <div className="absolute inset-0 bg-grid opacity-[0.18]" />
            </div>

            <div className="relative mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60 backdrop-blur">
                <Clock className="h-3.5 w-3.5 text-accent-300" />
                Booking takes 60 seconds
              </span>

              <h2 className="mt-6 text-display-2 text-balance text-white">
                Ready for a calmer kind of <span className="italic text-primary-300">dentistry</span>?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-[16px] leading-relaxed text-white/55">
                Pick a time, tell us what&apos;s going on, and we&apos;ll have everything ready before
                you arrive. No waiting rooms, no guesswork.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <MagneticButton>
                  <Link
                    to="/booking"
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink-950 shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <Calendar className="h-4 w-4" />
                    Book an appointment
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
                <a
                  href="tel:+914244272494"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-white/80 transition-all hover:border-white/35 hover:text-white"
                >
                  <Phone className="h-4 w-4" /> Call 0424 427 2494
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[12px] text-white/45">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary-300" /> HIPAA-compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-300" /> 4.9 from 2,000+ patients
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-accent-300" /> WhatsApp replies in ~5 min
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
