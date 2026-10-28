import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import toast from "react-hot-toast";
import {
  Calendar,
  CheckCircle2,
  List,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  X,
} from "lucide-react";
import { api, ApiError, statusTone, type Booking, type BookingStatus } from "@/lib/api";

type Meta = {
  services: { value: string; label: string }[];
  dentists: string[];
  slots: string[];
};

const emptyForm = {
  patientName: "",
  patientPhone: "",
  patientEmail: "",
  service: "general-dentistry",
  date: "",
  time: "9:00 AM",
  dentist: "",
};

const nextStatus = (status: BookingStatus): BookingStatus | null => {
  if (status === "pending") return "confirmed";
  if (status === "confirmed") return "checked_in";
  if (status === "checked_in") return "completed";
  return null;
};

const actionLabel = (status: BookingStatus) => {
  if (status === "pending") return "Confirm";
  if (status === "confirmed") return "Check in";
  if (status === "checked_in") return "Complete";
  return null;
};

export default function AppointmentsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [aptOpen, setAptOpen] = useState(false);
  const [aptForm, setAptForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const data = await api.get<{ bookings: Booking[] }>("/api/admin/bookings");
      setBookings(data.bookings);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    api
      .get<Meta>("/api/meta")
      .then(setMeta)
      .catch(() => {});
  }, [load]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: bookings.length };
    bookings.forEach((b) => {
      base[b.status] = (base[b.status] ?? 0) + 1;
    });
    return base;
  }, [bookings]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return bookings;
    return bookings.filter(
      (b) =>
        b.patientName.toLowerCase().includes(term) ||
        b.ref.toLowerCase().includes(term) ||
        b.patientPhone.toLowerCase().includes(term) ||
        b.serviceLabel.toLowerCase().includes(term) ||
        b.dentist.toLowerCase().includes(term),
    );
  }, [bookings, search]);

  const updateStatus = async (booking: Booking, status: BookingStatus) => {
    setBusyId(booking.id);
    try {
      const data = await api.patch<{ booking: Booking }>(`/api/admin/bookings/${booking.id}`, { status });
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? data.booking : b)));
      toast.success(`${booking.patientName} · ${data.booking.statusLabel}`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not update the appointment.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async () => {
    if (!aptForm.patientName.trim() || !aptForm.date) {
      toast.error("Patient name and date are required.");
      return;
    }
    if (aptForm.patientPhone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a valid patient phone number.");
      return;
    }
    setCreating(true);
    try {
      const data = await api.post<{ booking: Booking }>("/api/admin/bookings", aptForm);
      setBookings((prev) => [data.booking, ...prev]);
      toast.success(`Appointment ${data.booking.ref} created for ${data.booking.patientName}`);
      setAptForm(emptyForm);
      setAptOpen(false);
      setView("list");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not create the appointment.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Clinic workspace
          </span>
          <h1 className="mt-3 text-display-3 text-foreground">Appointments</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Every booking made on the website lands here instantly — with contact details and WhatsApp updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void load()} aria-label="Refresh appointments">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <div className="flex rounded-full border border-border/70 bg-card p-1">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`rounded-full p-1.5 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("calendar")}
              aria-label="Agenda view"
              className={`rounded-full p-1.5 ${view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setAptOpen(true)}>
            <Plus className="h-4 w-4" /> New appointment
          </Button>
        </div>
      </div>

      <Modal
        isOpen={aptOpen}
        onClose={() => setAptOpen(false)}
        title="New appointment"
        description="Book a walk-in or phone booking. It appears in the patient's portal too."
      >
        <div className="space-y-4">
          <Input
            label="Patient name"
            required
            value={aptForm.patientName}
            onChange={(e) => setAptForm({ ...aptForm, patientName: e.target.value })}
            placeholder="Full name"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone (WhatsApp)"
              type="tel"
              required
              value={aptForm.patientPhone}
              onChange={(e) => setAptForm({ ...aptForm, patientPhone: e.target.value })}
              placeholder="98765 43210"
            />
            <Input
              label="Email"
              type="email"
              value={aptForm.patientEmail}
              onChange={(e) => setAptForm({ ...aptForm, patientEmail: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <Select
            label="Service"
            required
            value={aptForm.service}
            onChange={(e) => setAptForm({ ...aptForm, service: e.target.value })}
            options={meta?.services ?? [{ value: "general-dentistry", label: "General Check-up & Cleaning" }]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              required
              value={aptForm.date}
              onChange={(e) => setAptForm({ ...aptForm, date: e.target.value })}
            />
            <Select
              label="Time"
              required
              value={aptForm.time}
              onChange={(e) => setAptForm({ ...aptForm, time: e.target.value })}
              options={(meta?.slots ?? ["9:00 AM"]).map((time) => ({ value: time, label: time }))}
            />
          </div>
          <Select
            label="Dentist"
            placeholder="First available"
            value={aptForm.dentist}
            onChange={(e) => setAptForm({ ...aptForm, dentist: e.target.value })}
            options={(meta?.dentists ?? []).map((name) => ({ value: name, label: name }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} loading={creating}>
              <UserCheck className="h-4 w-4" /> Create appointment
            </Button>
          </div>
        </div>
      </Modal>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ref, phone, service…"
            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          />
        </div>
        <span className="text-[12px] text-muted-foreground">
          {loading ? "Loading…" : `${visible.length} bookings`}
        </span>
      </div>

      <Tabs
        tabs={[
          { id: "all", label: `All (${counts.all ?? 0})` },
          { id: "pending", label: `Pending (${counts.pending ?? 0})` },
          { id: "confirmed", label: `Confirmed (${counts.confirmed ?? 0})` },
          { id: "checked_in", label: `Checked in (${counts.checked_in ?? 0})` },
          { id: "completed", label: `Completed (${counts.completed ?? 0})` },
          { id: "cancelled", label: `Cancelled (${counts.cancelled ?? 0})` },
        ]}
      >
        {(activeTab) => {
          const rows = activeTab === "all" ? visible : visible.filter((b) => b.status === activeTab);

          if (loading) {
            return (
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-5 py-10 text-[13px] text-muted-foreground shadow-soft">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading appointments…
              </div>
            );
          }

          if (view === "calendar") {
            return (
              <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-4">
                  <div>
                    <h2 className="font-display text-lg font-medium text-foreground">Agenda</h2>
                    <p className="text-[12px] text-muted-foreground">
                      {rows.length} appointment{rows.length === 1 ? "" : "s"} in this view
                    </p>
                  </div>
                  <Badge variant="info">{rows.length} shown</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  {rows.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-secondary-50/30 px-4 py-3"
                    >
                      <span className="w-24 shrink-0 text-[12px] font-semibold tabular-nums text-primary-700">
                        {apt.dateLabel}
                      </span>
                      <span className="w-16 shrink-0 text-[12px] font-semibold tabular-nums text-primary-700">
                        {apt.time}
                      </span>
                      <span className="h-10 w-1 shrink-0 rounded-full bg-primary-300" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">{apt.patientName}</p>
                        <p className="truncate text-[11.5px] text-muted-foreground">
                          {apt.serviceLabel} · {apt.dentist} · {apt.patientPhone} · {apt.ref}
                        </p>
                      </div>
                      <Badge variant={statusTone[apt.status]} size="sm">
                        {apt.statusLabel}
                      </Badge>
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
                    </div>
                  ))}
                  {rows.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center">
                      <p className="text-sm font-medium text-foreground">No appointments in this view</p>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        New website bookings will show up here automatically.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-soft">
              <table className="w-full min-w-[880px]">
                <thead>
                  <tr className="border-b border-border/70 bg-secondary-50/50">
                    {["Patient", "Service", "When", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((apt) => {
                    const next = nextStatus(apt.status);
                    const label = actionLabel(apt.status);
                    const canCancel = apt.status === "pending" || apt.status === "confirmed";
                    return (
                      <tr key={apt.id} className="border-b border-border/60 transition-colors hover:bg-secondary-50/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-medium text-primary-700">
                              {apt.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">{apt.patientName}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {apt.patientPhone} · {apt.ref}
                              </p>
                              {apt.notes && (
                                <p className="mt-0.5 max-w-[220px] truncate text-[11px] italic text-muted-foreground/80">
                                  “{apt.notes}”
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground/75">
                          {apt.serviceLabel}
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">{apt.dentist}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground/75">
                          {apt.dateLabel}
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">{apt.time}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusTone[apt.status]} size="sm">
                            {apt.statusLabel}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {next && label && (
                              <button
                                onClick={() => void updateStatus(apt, next)}
                                disabled={busyId === apt.id}
                                className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-[11.5px] font-medium text-primary-700 transition-colors hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {label}
                              </button>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => void updateStatus(apt, "cancelled")}
                                disabled={busyId === apt.id}
                                aria-label={`Cancel booking for ${apt.patientName}`}
                                className="rounded-full border border-border/70 p-1.5 text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {apt.whatsapp?.patient && (
                              <a
                                href={apt.whatsapp.patient}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`WhatsApp ${apt.patientName}`}
                                title="Send this booking's status on WhatsApp"
                                className="rounded-full border border-emerald-200 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <p className="text-sm font-medium text-foreground">No appointments found</p>
                        <p className="mt-1 text-[12px] text-muted-foreground">
                          Confirm a booking from a patient or create a walk-in appointment.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        }}
      </Tabs>
    </DashboardLayout>
  );
}
