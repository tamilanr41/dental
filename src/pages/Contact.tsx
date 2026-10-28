import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { PageHero } from "@/components/layout/PageHero";
import { LiveChat } from "@/components/home/LiveChat";
import { CheckCircle, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

const details = [
  { icon: Phone, label: "Phone", value: "0424 427 2494", href: "tel:+914244272494" },
  { icon: Mail, label: "Email", value: "info@srisaraswathidental.com", href: "mailto:info@srisaraswathidental.com" },
  { icon: MapPin, label: "Address", value: "866, Soli Complex, Surampatti Four Rd\nErode, Tamil Nadu 638009" },
  { icon: Clock, label: "Hours", value: "Mon–Sat: 9:00 AM – 8:45 PM\nSun: Emergency only" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-background">
        <PageHero
          eyebrow="Support & inquiry"
          title={
            <>
              Say hello. We <span className="italic text-primary-700">answer.</span>
            </>
          }
          description="Questions about treatment, insurance or your first visit? Our front desk replies within one business day — usually much sooner."
          actions={
            <>
              <Button asChild size="lg">
                <a href="tel:+914244272494">
                  <Phone className="h-4 w-4" /> Call the clinic
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://wa.me/919345743409" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
              </Button>
            </>
          }
          aside={
            <div className="grid gap-3 sm:grid-cols-2">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-soft backdrop-blur"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <d.icon className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {d.label}
                  </p>
                  {d.href ? (
                    <a
                      href={d.href}
                      className="mt-1 block text-[14px] font-medium text-foreground transition-colors hover:text-primary-700"
                    >
                      {d.value}
                    </a>
                  ) : (
                    <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-foreground/80">
                      {d.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          }
        />

        <section className="section-pad">
          <div className="container-x">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
              <div className="lg:sticky lg:top-32">
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> Reach us directly
                </span>
                <h2 className="mt-5 text-display-3 text-balance">
                  Real people, on the other end of the line
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  No phone trees, no scripted bots for urgent questions. A member of our team
                  picks up during clinic hours — and emergencies route straight to the on-call
                  dentist.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    { label: "New patient booking", value: "~60 seconds online" },
                    { label: "Insurance & billing", value: "Verified before you arrive" },
                    { label: "Dental emergency", value: "Same-day slots held daily" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary-50/60 px-4 py-3"
                    >
                      <span className="text-[13px] text-muted-foreground">{row.label}</span>
                      <span className="text-[13px] font-medium text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-card md:p-8">
                {!submitted ? (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-2xl font-medium text-foreground">
                          Send a message
                        </h3>
                        <p className="mt-1.5 text-[13px] text-muted-foreground">
                          Tell us what you need — we&apos;ll route it to the right team.
                        </p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                        <Send className="h-4 w-4" />
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
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input label="First name" required />
                          <Input label="Last name" required />
                        </div>
                        <Input label="Email" type="email" required />
                        <Input label="Phone" type="tel" />
                        <Input label="Subject" required />
                        <TextArea label="Message" required rows={5} />
                        <Button type="submit" size="lg" fullWidth>
                          Send message
                        </Button>
                        <p className="text-center text-[11px] text-muted-foreground">
                          By sending, you agree to our privacy policy. We never share your data.
                        </p>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <CheckCircle className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-medium text-foreground">
                      Message sent
                    </h3>
                    <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted-foreground">
                      Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                      Send another
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
