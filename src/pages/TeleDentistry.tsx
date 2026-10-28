import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Image,
  MessageSquare,
  Mic,
  Phone,
  Shield,
  Users,
  Video,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LiveChat } from "@/components/home/LiveChat";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import toast from "react-hot-toast";

const upcomingCalls = [
  { id: 1, doctor: "Dr. Sarah Johnson", date: "Jul 15, 2026", time: "10:00 AM", type: "Follow-up", status: "Confirmed" },
  { id: 2, doctor: "Dr. Michael Chen", date: "Jul 20, 2026", time: "2:00 PM", type: "Consultation", status: "Scheduled" },
];

const features = [
  { icon: Video, title: "Video consultations", desc: "Face-to-face time with your dentist, from anywhere with a signal." },
  { icon: MessageSquare, title: "Secure messaging", desc: "Encrypted notes and photos between visits, all in one thread." },
  { icon: Image, title: "Image sharing", desc: "Send a photo of the concern and get a same-day read." },
  { icon: Calendar, title: "Smart follow-ups", desc: "Automated check-ins that happen at the right interval." },
  { icon: Shield, title: "DPDP compliant", desc: "End-to-end encryption on every call and message." },
  { icon: Users, title: "Family access", desc: "Manage consultations for children and dependants." },
];

export default function TeleDentistryPage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <PageHero
          eyebrow="Tele-dentistry"
          title={
            <>
              The clinic, <span className="italic text-primary-700">without the commute.</span>
            </>
          }
          description="Secure video consultations, encrypted messaging and digital treatment planning — for the visits that don't need a chair."
          actions={
            <>
              <Button asChild size="lg">
                <Link to="/booking">
                  <Video className="h-4 w-4" /> Start a consultation
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="tel:+1234567890">
                  <Phone className="h-4 w-4" /> Talk to reception
                </a>
              </Button>
            </>
          }
          aside={
            <div className="relative overflow-hidden rounded-[26px] border border-border/70 bg-ink-950 p-1.5 shadow-lift">
              <div className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-[20px] bg-gradient-to-br from-primary-800 via-primary-900 to-ink-950 p-5">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-400/20 blur-3xl" />
                <div className="relative flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/70 backdrop-blur">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Live consult
                  </span>
                  <span className="text-[11px] tabular-nums text-white/40">04:12</span>
                </div>

                <div className="relative flex flex-1 items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/10 font-display text-2xl text-white backdrop-blur">
                    SJ
                  </div>
                </div>

                <div className="relative">
                  <p className="font-display text-lg text-white">Dr. Sarah Johnson</p>
                  <p className="text-[11px] text-white/50">Follow-up · Treatment review</p>
                  <div className="mt-4 flex items-center justify-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur">
                      <Mic className="h-4 w-4" />
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur">
                      <Video className="h-4 w-4" />
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30">
                      <Phone className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <section className="section-pad">
          <div className="container-x">
            <ScrollReveal>
              <div className="max-w-2xl">
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> What you get
                </span>
                <h2 className="mt-5 text-display-2 text-balance">
                  Everything except the <span className="italic text-primary-700">waiting room</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad border-y border-border/60 bg-secondary-50/60">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> Your schedule
                </span>
                <h2 className="mt-5 text-display-3">Upcoming consultations</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/patient-portal/appointments">View all appointments</Link>
              </Button>
            </div>

            <div className="mt-8 space-y-3">
              {upcomingCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-shadow hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">{call.doctor}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {call.date} at {call.time} · {call.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <Badge variant={call.status === "Confirmed" ? "success" : "default"}>
                      {call.status}
                    </Badge>
                    <Button size="sm" onClick={() => toast.success(`Connecting to your secure call with ${call.doctor}…`)}>
                      <Video className="h-4 w-4" /> Join now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LiveChat />
    </>
  );
}
