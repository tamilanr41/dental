import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LiveChat } from "@/components/home/LiveChat";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { clinicImages } from "@/lib/images";

const focusAreas = [
  "General & family dentistry",
  "Root canal treatment",
  "Crowns & bridges",
  "Gum treatment",
  "Preventive check-ups",
  "Smile design",
];

export default function DentistsPage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <PageHero
          eyebrow="Your dentist"
          title={
            <>
              The dentist you&apos;ll actually <span className="italic text-primary-700">see.</span>
            </>
          }
          description="Sri Saraswathi Dental Clinic is led by Dr. Kishore Kumar — the same clinical lead at every visit, with treatment plans explained in plain language."
          actions={
            <Button asChild size="lg">
              <Link to="/booking">
                <Calendar className="h-4 w-4" /> Book an appointment
              </Link>
            </Button>
          }
        />

        <section className="section-pad">
          <div className="container-x">
            <ScrollReveal>
              <article className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
                <div className="grid gap-8 p-6 md:grid-cols-[300px_1fr] md:p-8 lg:gap-12">
                  <div>
                    <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-2xl bg-secondary-100 md:mx-0">
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
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-4 pt-10 text-[11px] font-medium text-white/80">
                        Our dentist · Erode
                      </span>
                    </div>

                    <div className="mx-auto mt-4 max-w-[300px] space-y-2 md:mx-0">
                      <Button asChild size="sm" fullWidth>
                        <Link to="/booking">
                          <Calendar className="h-3.5 w-3.5" /> Book a visit
                        </Link>
                      </Button>
                      <p className="text-center text-[11px] text-muted-foreground">
                        Mon–Sat · 9:00 AM – 8:45 PM
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-2xl font-medium text-foreground md:text-[28px]">
                          Dr. Kishore Kumar
                        </h2>
                        <p className="mt-1 text-[13px] font-medium text-primary-700">
                          Founder &amp; Chief Dental Surgeon
                        </p>
                      </div>
                      <Badge variant="success" size="sm">
                        Accepting patients
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {focusAreas.map((area) => (
                        <Badge key={area} variant="info" size="sm">
                          {area}
                        </Badge>
                      ))}
                    </div>

                    <p className="mt-4 text-pretty text-[14px] leading-relaxed text-muted-foreground">
                      Dr. Kishore Kumar founded Sri Saraswathi Dental Clinic in Erode with a simple
                      promise: explain the problem clearly, show the options, and let you decide.
                      Every visit starts with a conversation — what is happening, what it will
                      cost, and what happens next — before any treatment begins.
                    </p>

                    <div className="mt-5 grid gap-4 border-t border-border/60 pt-5 sm:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          How visits work
                        </h4>
                        {[
                          "Book online — confirmation on WhatsApp",
                          "Check-up and a clear cost estimate first",
                          "Treatment only once you approve the plan",
                        ].map((item) => (
                          <p key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-foreground/75">
                            <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-primary-500" />
                            {item}
                          </p>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Clinic
                        </h4>
                        <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-foreground/75">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-primary-500" />
                          866, Soli Complex, Surampatti Four Rd, Erode, Tamil Nadu 638009
                        </p>
                        <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-foreground/75">
                          <Clock className="mt-0.5 h-3 w-3 shrink-0 text-primary-500" />
                          Mon–Sat 9:00 AM – 8:45 PM · Sunday emergency only
                        </p>
                        <a
                          href="tel:+914244272494"
                          className="flex items-center gap-2 text-[12.5px] text-foreground/75 transition-colors hover:text-primary-700"
                        >
                          <Phone className="h-3 w-3 shrink-0 text-primary-500" />
                          0424 427 2494
                        </a>
                        <a
                          href="https://share.google/Izecs47hnhjCpmBBs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary-700 link-underline"
                        >
                          Get directions on Google Maps
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <LiveChat />
    </>
  );
}

