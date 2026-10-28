"use client";

import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRight, CalendarCheck, Clock, MapPin, Phone } from "lucide-react";
import { clinicImages } from "@/lib/images";

const doctor = {
  name: "Dr. Dinesh Kumar",
  title: "Founder & Chief Dental Surgeon",
  focus: ["Family dentistry", "Restorative care", "Preventive care"],
  bio: "Every visit at Sri Saraswathi Dental Clinic starts with a clear explanation — what is happening, what it will cost, and what your options are. No jargon, no pressure, and a treatment plan you can actually follow.",
  image: clinicImages.treatmentRoom,
};

export function DentistProfiles() {
  return (
    <section className="section-pad relative overflow-hidden bg-background">
      <div className="container-x">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Your dentist"
            title={
              <>
                Care led by a dentist who <span className="italic text-primary-700">explains</span>.
              </>
            }
            description="One clinical lead for the whole clinic — so your treatment plan stays consistent from the first check-up to the final review."
            action={
              <Link
                to="/dentists"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground/75 transition-all hover:border-foreground/20 hover:text-foreground"
              >
                Meet your dentist
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
        </ScrollReveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-5 lg:gap-8">
          <ScrollReveal className="lg:col-span-3" direction="left">
            <div className="relative h-full overflow-hidden rounded-[26px] border border-border/80 bg-card shadow-card">
              <div className="grid h-full md:grid-cols-2">
                <div className="relative min-h-[240px] md:min-h-[420px]">
                  <img
                    src={doctor.image}
                    alt="Dental treatment room at Sri Saraswathi Dental Clinic"
                    width={1360}
                    height={907}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
                      Treatment room · Erode
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-7 md:p-8">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {doctor.focus.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-medium text-primary-700 ring-1 ring-inset ring-primary-600/10"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-[28px] leading-tight text-foreground">
                    {doctor.name}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">{doctor.title}</p>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>
                  <Link
                    to="/booking"
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-800"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Book with Dr. Dinesh
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="space-y-3 lg:col-span-2">
            <ScrollReveal direction="right">
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Visit us
                </p>
                <div className="mt-4 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                    <span className="leading-relaxed text-foreground/80">
                      866, Soli Complex, Surampatti Four Rd, Erode, Tamil Nadu 638009
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                    <span className="leading-relaxed text-foreground/80">
                      Mon–Sat: 9:00 AM – 8:45 PM
                      <br />
                      Sunday: Emergency only
                    </span>
                  </div>
                  <a href="tel:+914244272494" className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-primary-600" />
                    <span className="text-foreground/80 transition-colors hover:text-primary-700">
                      0424 427 2494
                    </span>
                  </a>
                </div>
                <a
                  href="https://share.google/Izecs47hnhjCpmBBs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-700 link-underline"
                >
                  Get directions on Google Maps
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1}>
              <div className="rounded-2xl border border-border/80 bg-ink-950 p-6 text-white shadow-soft">
                <p className="font-display text-[19px] leading-tight">First visit, or a second opinion?</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                  Free consultations are available every working day — same-day slots often open up
                  in the evening.
                </p>
                <Link
                  to="/booking"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-ink-950 transition-transform hover:-translate-y-0.5"
                >
                  Check availability
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
