import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { Search, Plus, MoreHorizontal, Mail, Phone, UserPlus, Calendar, X } from "lucide-react";

type Patient = {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: string;
  dob: string;
};

const initialPatients: Patient[] = [
  { id: 1, name: "Jessica Martinez", email: "jessica@example.com", phone: "+91 98400 11001", lastVisit: "Jul 10, 2026", status: "Active", dob: "Jan 15, 1990" },
  { id: 2, name: "Robert Kim", email: "robert@example.com", phone: "+91 98400 11002", lastVisit: "Jul 8, 2026", status: "Active", dob: "Mar 22, 1985" },
  { id: 3, name: "Amanda Foster", email: "amanda@example.com", phone: "+91 98400 11003", lastVisit: "Jul 5, 2026", status: "Active", dob: "Aug 10, 1995" },
  { id: 4, name: "David Thompson", email: "david@example.com", phone: "+91 98400 11004", lastVisit: "Jun 28, 2026", status: "Active", dob: "Nov 5, 1978" },
  { id: 5, name: "Sarah Lee", email: "sarah@example.com", phone: "+91 98400 11005", lastVisit: "Jun 20, 2026", status: "Inactive", dob: "May 30, 2000" },
  { id: 6, name: "Michael Brown", email: "michael@example.com", phone: "+91 98400 11006", lastVisit: "Jun 15, 2026", status: "Active", dob: "Sep 12, 1988" },
];

export default function PatientsPage() {
  const [params] = useSearchParams();
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [ptOpen, setPtOpen] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [ptForm, setPtForm] = useState({ name: "", email: "", phone: "", dob: "" });

  const filtered = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase()) ||
          p.phone.includes(search)
      ),
    [patients, search]
  );

  const handleAddPatient = () => {
    if (!ptForm.name.trim() || !ptForm.email.trim() || !ptForm.phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    const next: Patient = {
      id: Math.max(...patients.map((p) => p.id)) + 1,
      name: ptForm.name.trim(),
      email: ptForm.email.trim(),
      phone: ptForm.phone.trim(),
      dob: ptForm.dob ? new Date(ptForm.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—",
      lastVisit: "New patient",
      status: "Active",
    };
    setPatients((current) => [next, ...current]);
    toast.success(`${next.name} added successfully`);
    setPtForm({ name: "", email: "", phone: "", dob: "" });
    setPtOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> Clinic workspace</span>
          <h1 className="mt-3 text-display-3 text-foreground">Patients</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {patients.length} patient records · manage history and contact details.
          </p>
        </div>
        <Button onClick={() => setPtOpen(true)}><Plus className="h-4 w-4" /> Add Patient</Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search patients"
            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-10 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-secondary-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-soft">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-border/70 bg-secondary-50/50">
              {["Patient", "Contact", "DOB", "Last Visit", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">
                      {p.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="font-medium text-foreground">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span className="flex items-center gap-1 text-foreground/75"><Mail className="h-3 w-3" />{p.email}</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{p.phone}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground/75">{p.dob}</td>
                <td className="px-4 py-3 text-sm text-foreground/75">{p.lastVisit}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "Active" ? "success" : "default"}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(p)}
                    aria-label={`View ${p.name}`}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary-100 hover:text-primary-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No patients match &ldquo;{search}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={ptOpen} onClose={() => setPtOpen(false)} title="Add New Patient" description="Register a new patient in the system.">
        <div className="space-y-4">
          <Input label="Full name" required value={ptForm.name} onChange={(e) => setPtForm({ ...ptForm, name: e.target.value })} placeholder="e.g. Ananya Iyer" />
          <Input label="Email" type="email" required value={ptForm.email} onChange={(e) => setPtForm({ ...ptForm, email: e.target.value })} placeholder="ananya@example.com" />
          <Input label="Phone" required value={ptForm.phone} onChange={(e) => setPtForm({ ...ptForm, phone: e.target.value })} placeholder="98765 43210" />
          <Input label="Date of birth" type="date" value={ptForm.dob} onChange={(e) => setPtForm({ ...ptForm, dob: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setPtOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPatient}><UserPlus className="h-4 w-4" /> Add patient</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? "Patient"} description="Patient profile and contact details.">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-secondary-50/70 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {selected.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium text-foreground">{selected.name}</p>
                <p className="text-sm text-muted-foreground">DOB {selected.dob} · {selected.status}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-foreground/75"><Mail className="h-4 w-4 text-muted-foreground" />{selected.email}</p>
              <p className="flex items-center gap-2 text-foreground/75"><Phone className="h-4 w-4 text-muted-foreground" />{selected.phone}</p>
              <p className="flex items-center gap-2 text-foreground/75"><Calendar className="h-4 w-4 text-muted-foreground" />Last visit {selected.lastVisit}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              <Button asChild>
                <Link to="/dashboard/appointments"><Calendar className="h-4 w-4" /> Book appointment</Link>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
