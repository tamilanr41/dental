import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Ambulance,
  CheckCircle,
  Clock,
  Phone,
  Shield,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { LiveChat } from "@/components/home/LiveChat";

const emergencies = [
  "Severe toothache",
  "Knocked-out tooth",
  "Broken or chipped tooth",
  "Lost filling or crown",
  "Abscess or infection",
  "Bleeding that won't stop",
  "Swollen jaw or face",
  "Injury to soft tissues",
  "Broken braces or wires",
  "Severe sensitivity",
];

export default function EmergencyPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-background">
        <PageHero
          tone="ink"
          eyebrow="Emergency care · 24/7"
          title={
            <>
              When it hurts, <span className="italic text-accent-300">we&apos;re awake.</span>
            </>
          }
          description="Severe pain, a broken tooth, swelling that won't settle — call us and we'll hold a same-day slot. Real clinicians answer, day or night."
          actions={
            <>
              <Button asChild variant="danger" size="lg">
                <a href="tel:+914244272494">
                  <Phone className="h-4 w-4" /> Call 0424 427 2494
                </a>
              </Button>
              <Link
                to="/booking?service=emergency"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-white/80 transition-all hover:border-white/35 hover:text-white"
              >
                Request a callback
              </Link>
            </>
          }
          aside={
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md md:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent-300">
                  <Zap className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-white">Emergency line</p>
                  <p className="text-[11px] text-white/45">Staffed around the clock</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-5">
                {[
                  { value: "5 min", label: "Average callback" },
                  { value: "Same day", label: "Emergency slots" },
                  { value: "7 days", label: "Open every week" },
                  { value: "24/7", label: "Phone triage" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-medium text-white">{s.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/40">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-start gap-2 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/45">
                <Ambulance className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-300" />
                Life-threatening emergency? Call 911 immediately.
              </div>
            </div>
          }
        />

        <section className="section-pad">
          <div className="container-x">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> What we treat
                </span>
                <h2 className="mt-5 text-display-3 text-balance">
                  If it can&apos;t wait until Monday
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  Our on-call team handles urgent dental problems with the same equipment and
                  specialists you&apos;d see during a routine visit.
                </p>

                <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                  {emergencies.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 rounded-xl border border-accent/15 bg-accent-50/60 px-3.5 py-3 text-[13px] font-medium text-foreground/85"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-accent" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">
                        Same-day emergency appointments
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        We keep slots open every day for urgent cases. Call and we&apos;ll triage
                        you over the phone in under five minutes.
                      </p>
                      <Button asChild size="sm" className="mt-4">
                        <a href="tel:+914244272494">
                          <Phone className="h-3.5 w-3.5" /> Call the emergency line
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {!submitted ? (
                  <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card md:p-8">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 text-accent">
                        <Clock className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="font-display text-2xl font-medium text-foreground">
                          Request emergency care
                        </h3>
                        <p className="text-[12px] text-muted-foreground">
                          A clinician will call you back within 5 minutes.
                        </p>
                      </div>
                    </div>

                    <form
                      className="mt-7"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSubmitted(true);
                      }}
                    >
                      <div className="space-y-4">
                        <Input label="Full name" required placeholder="Your name" />
                        <Input label="Phone number" type="tel" required placeholder="98765 43210" />
                        <Select
                          label="Emergency type"
                          required
                          placeholder="Select your emergency"
                          options={[
                            { value: "toothache", label: "Severe Toothache" },
                            { value: "knocked-out", label: "Knocked-out Tooth" },
                            { value: "broken", label: "Broken/Chipped Tooth" },
                            { value: "abscess", label: "Abscess/Infection" },
                            { value: "bleeding", label: "Uncontrolled Bleeding" },
                            { value: "swelling", label: "Swelling" },
                            { value: "injury", label: "Injury/Trauma" },
                            { value: "other", label: "Other Emergency" },
                          ]}
                        />
                        <Select
                          label="Pain severity"
                          required
                          placeholder="Rate your pain (1-10)"
                          options={Array.from({ length: 10 }, (_, i) => ({
                            value: String(i + 1),
                            label: `${i + 1} - ${i < 3 ? "Mild" : i < 7 ? "Moderate" : "Severe"}`,
                          }))}
                        />
                        <TextArea label="Brief description" placeholder="Describe your symptoms…" />
                        <Button type="submit" variant="danger" size="lg" fullWidth>
                          <AlertTriangle className="h-4 w-4" /> Submit emergency request
                        </Button>
                        <p className="text-center text-[11px] text-muted-foreground">
                          For life-threatening emergencies, call 911 immediately.
                        </p>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/60 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-medium text-foreground">
                      Request received
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
                      A team member will contact you within 5 minutes. If symptoms worsen, call
                      the emergency line directly.
                    </p>
                    <Button asChild variant="danger" className="mt-6">
                      <a href="tel:+914244272494">
                        <Phone className="h-4 w-4" /> Call us directly
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <LiveChat />
    </>
  );
}
