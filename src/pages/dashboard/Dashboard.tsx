import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/ui/StatsCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Calendar,
  CheckCircle2,
  Clock,
  Images,
  LayoutTemplate,
  Loader2,
  Megaphone,
  MessageCircle,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { api, ApiError, statusTone, type AdminSummary } from "@/lib/api";

const relative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [seating, setSeating] = useState<number | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const data = await api.get<AdminSummary>("/api/admin/summary");
      setSummary(data);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not load today's snapshot.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const todayIndex = (now.getDay() + 6) % 7;

  const seatPatient = async (id: number, patient: string) => {
    setSeating(id);
    try {
      await api.patch(`/api/admin/bookings/${id}`, { status: "checked_in" });
      toast.success(`${patient} checked in`);
      await load(true);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not update the booking.");
    } finally {
      setSeating(null);
    }
  };

  const counts = summary?.counts;
  const week = summary?.week ?? [];
  const maxWeek = Math.max(1, ...week.map((d) => d.count));
  const weekTotal = week.reduce((sum, d) => sum + d.count, 0);
  const queue = summary?.queue ?? [];
  const schedule = summary?.todaySchedule ?? [];

  const stats = [
    {
      title: "Appointments today",
      value: counts ? String(counts.today) : "—",
      icon: Calendar,
      description: counts ? `${counts.checkedIn} checked in · ${counts.completed} completed` : "Loading…",
      variant: "primary" as const,
    },
    {
      title: "Pending confirmations",
      value: counts ? String(counts.pending) : "—",
      icon: Clock,
      description: "New website bookings awaiting a call",
      variant: counts && counts.pending > 0 ? ("warning" as const) : ("success" as const),
    },
    {
      title: "Registered patients",
      value: counts ? String(counts.patients) : "—",
      icon: Users,
      description: "Accounts created on the website",
      variant: "default" as const,
    },
    {
      title: "Completed visits",
      value: counts ? String(counts.completed) : "—",
      icon: CheckCircle2,
      description: counts ? `${counts.totalBookings} bookings all time` : "Loading…",
      variant: "success" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <h1 className="mt-3 text-display-3">
            {greeting}, {user?.firstName ?? "Doctor"}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Live bookings, confirmations and WhatsApp follow-ups in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void load()}>
            <Loader2 className={loading ? "h-4 w-4 animate-spin" : "hidden"} />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/dashboard/appointments">
              <Calendar className="h-4 w-4" /> Appointment board
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-ink-900 bg-ink-950 p-0 text-white">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                  <Calendar className="h-3 w-3 text-accent-300" /> New bookings this week
                </span>
                <p className="mt-2 font-display text-3xl font-medium tracking-tight">
                  {weekTotal} <span className="text-base font-normal text-white/45">bookings created</span>
                </p>
              </div>
              <Link
                to="/dashboard/appointments"
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              >
                Open board <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-6 flex items-end gap-2 px-5 sm:gap-3">
              {week.map((d, index) => (
                <div key={d.date} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end" title={`${d.label}: ${d.count} booking${d.count === 1 ? "" : "s"}`}>
                    <div
                      className={
                        index === todayIndex
                          ? "w-full rounded-t-md bg-accent transition-colors"
                          : "w-full rounded-t-md bg-white/15 transition-colors group-hover:bg-white/30"
                      }
                      style={{ height: `${Math.max(6, Math.round((d.count / maxWeek) * 100))}%` }}
                    />
                  </div>
                  <span
                    className={
                      index === todayIndex
                        ? "text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-200"
                        : "text-[10px] uppercase tracking-[0.08em] text-white/35"
                    }
                  >
                    {d.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 text-center">
              <div className="px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">Today</p>
                <p className="mt-1 text-[13px] font-semibold text-white">{counts?.today ?? 0}</p>
              </div>
              <div className="px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">Pending</p>
                <p className="mt-1 text-[13px] font-semibold text-amber-300">{counts?.pending ?? 0}</p>
              </div>
              <div className="px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">Confirmed</p>
                <p className="mt-1 text-[13px] font-semibold text-white">{counts?.confirmed ?? 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-medium text-foreground">Today&apos;s schedule</h2>
                <p className="text-[12px] text-muted-foreground">
                  {loading ? "Loading…" : `${schedule.length} booked · ${counts?.checkedIn ?? 0} checked in`}
                </p>
              </div>
              <Badge variant="info">Live</Badge>
            </div>
            <div className="divide-y divide-border/60">
              {schedule.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-secondary-50/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-14 shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
                      {apt.time}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-semibold text-primary-700">
                      {apt.patientName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{apt.patientName}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {apt.dentist} · {apt.serviceLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.whatsapp?.patient && (
                      <a
                        href={apt.whatsapp.patient}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp ${apt.patientName}`}
                        className="rounded-full border border-emerald-200 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Badge variant={statusTone[apt.status]} size="sm">
                      {apt.statusLabel}
                    </Badge>
                  </div>
                </div>
              ))}
              {!loading && schedule.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <p className="text-[13px] font-medium text-foreground">Nothing booked for today</p>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    New website bookings will appear here automatically.
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-border/70 px-5 py-3 text-center">
              <Link
                to="/dashboard/appointments"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-primary-700 hover:text-primary-800"
              >
                View full schedule <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-medium text-foreground">Waiting room</h2>
                <p className="text-[12px] text-muted-foreground">Today&apos;s pending &amp; confirmed visits</p>
              </div>
              <Badge variant={queue.length ? "warning" : "success"}>
                {queue.length ? `${queue.length} waiting` : "All clear"}
              </Badge>
            </div>
            <div className="mt-4 space-y-2.5">
              {queue.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-secondary-50/40 px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-foreground">{q.patientName}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {q.time} · {q.serviceLabel}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={seating === q.id}
                    onClick={() => void seatPatient(q.id, q.patientName)}
                  >
                    Check in
                  </Button>
                </div>
              ))}
              {!loading && queue.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-5 text-center">
                  <p className="text-[12.5px] font-medium text-foreground">No one waiting</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    All of today&apos;s patients are already checked in.
                  </p>
                </div>
              )}
            </div>
            <Link
              to="/dashboard/appointments"
              className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-primary-700 hover:text-primary-800"
            >
              Open appointment board <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-medium text-foreground">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {[
                { label: "Appointments", href: "/dashboard/appointments", icon: Calendar },
                { label: "Patients", href: "/dashboard/patients", icon: Users },
                { label: "Media library", href: "/dashboard/media", icon: Images },
                { label: "Blog", href: "/dashboard/blog", icon: BookOpenText },
                { label: "Offers", href: "/dashboard/offers", icon: Megaphone },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="group flex flex-col gap-3 rounded-xl border border-border/70 p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-soft"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                    <action.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[12px] font-medium leading-tight text-foreground/80">{action.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-medium text-foreground">Needs attention</h2>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-2">
              <Link
                to="/dashboard/appointments"
                className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-secondary-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-foreground">
                    {counts?.pending ?? 0} booking{(counts?.pending ?? 0) === 1 ? "" : "s"} awaiting confirmation
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    Confirm and send a WhatsApp update
                  </span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/dashboard/patients"
                className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-secondary-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Users className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-foreground">
                    {counts?.patients ?? 0} registered patient{(counts?.patients ?? 0) === 1 ? "" : "s"}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    Accounts created through the website
                  </span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/dashboard/content"
                className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-secondary-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <LayoutTemplate className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-foreground">Website content</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    Photos, credentials and clinic media
                  </span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-foreground">Latest bookings</h2>
            <Link
              to="/dashboard/appointments"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-700 hover:text-primary-800"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {(summary?.recent ?? []).map((booking) => (
              <div key={booking.id} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-600">
                  <Calendar className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] leading-snug text-foreground/85">
                    <span className="font-medium text-foreground">{booking.patientName}</span> booked{" "}
                    {booking.serviceLabel.toLowerCase()} for {booking.dateLabel}, {booking.time}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/60">
                    {booking.ref} · {relative(booking.createdAt)}
                    <Badge variant={statusTone[booking.status]}>{booking.statusLabel}</Badge>
                  </p>
                </div>
              </div>
            ))}
            {!loading && (summary?.recent ?? []).length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-5 text-center text-[12.5px] text-muted-foreground">
                No bookings yet — they will appear here the moment a patient books.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-foreground">Latest patients</h2>
            <Link
              to="/dashboard/patients"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-700 hover:text-primary-800"
            >
              Manage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(summary?.recentPatients ?? []).map((patient) => (
              <div key={patient.id} className="flex items-center gap-3">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-semibold text-primary-700">
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                      patient.lastLoginAt ? "bg-emerald-500" : "bg-secondary-300"
                    }`}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-foreground">{patient.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {patient.lastLoginAt
                      ? `Signed in ${relative(patient.lastLoginAt)} · ${patient.loginCount} sign-in${patient.loginCount === 1 ? "" : "s"}`
                      : "Registered · no sign-in recorded"}
                  </p>
                </div>
                <span className="text-[10.5px] text-muted-foreground">Joined {relative(patient.joinedAt)}</span>
              </div>
            ))}
            {!loading && (summary?.recentPatients ?? []).length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-5 text-center text-[12.5px] text-muted-foreground">
                No patient accounts yet. Patients appear here when they register.
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary-50 px-3 py-2.5 text-[11.5px] text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary-600" />
            {counts?.patients ?? 0} patient account{(counts?.patients ?? 0) === 1 ? "" : "s"} with portal access
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
