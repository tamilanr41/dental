import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { Calendar, Plus, Search } from "lucide-react";

type StaffMember = {
  id: number;
  name: string;
  role: string;
  department: string;
  status: "Active" | "On Leave";
  todayPatients: number;
  rating: number | null;
};

const initialStaff: StaffMember[] = [
  { id: 1, name: "Dr. Dinesh Kumar", role: "Chief Dental Surgeon", department: "Clinical", status: "Active", todayPatients: 8, rating: 4.9 },
  { id: 5, name: "Lisa Anderson", role: "Dental Hygienist", department: "Hygiene", status: "Active", todayPatients: 5, rating: 4.8 },
  { id: 6, name: "Maria Garcia", role: "Receptionist", department: "Front Desk", status: "Active", todayPatients: 0, rating: 4.6 },
];

const departments = ["Clinical", "Hygiene", "Front Desk", "Administration"];

const avatarName = (name: string) => {
  const parts = name.replace("Dr. ", "").split(" ").filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({ name: "", role: "", department: "Clinical", status: "Active" as StaffMember["status"] });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return staff;
    return staff.filter(
      (member) =>
        member.name.toLowerCase().includes(term) ||
        member.role.toLowerCase().includes(term) ||
        member.department.toLowerCase().includes(term),
    );
  }, [staff, search]);

  const activeCount = staff.filter((s) => s.status === "Active").length;

  const handleAddStaff = () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Please enter the staff member's name and role");
      return;
    }
    setStaff((prev) => [
      ...prev,
      {
        id: prev.reduce((max, s) => Math.max(max, s.id), 0) + 1,
        name: form.name.trim(),
        role: form.role.trim(),
        department: form.department,
        status: form.status,
        todayPatients: 0,
        rating: null,
      },
    ]);
    toast.success(`${form.name} added to the team`);
    setForm({ name: "", role: "", department: "Clinical", status: "Active" });
    setAddOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> Clinic workspace</span>
          <h1 className="mt-3 text-display-3 text-foreground">Staff Management</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {staff.length} team members · {activeCount} on duty today
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Staff</Button>
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add staff member" description="Create a profile for a new team member.">
        <div className="space-y-4">
          <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. Priya Nair" />
          <Input label="Role" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Endodontist" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              options={departments.map((d) => ({ value: d, label: d }))}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as StaffMember["status"] })}
              options={[
                { value: "Active", label: "Active" },
                { value: "On Leave", label: "On Leave" },
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStaff}><Plus className="h-4 w-4" /> Add member</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!scheduleFor} onClose={() => setScheduleFor(null)} title={scheduleFor ? `${scheduleFor.name} — today's schedule` : "Schedule"} description="Chair assignments and patient slots for today.">
        {scheduleFor && (
          <div className="space-y-2">
            {scheduleFor.todayPatients > 0 ? (
              [
                { time: "9:00 AM", patient: "Jessica Martinez", type: "Check-up", chair: "1" },
                { time: "10:30 AM", patient: "David Thompson", type: "Root Canal", chair: "3" },
                { time: "12:00 PM", patient: "Amanda Foster", type: "Review", chair: "2" },
                { time: "3:30 PM", patient: "Michael Brown", type: "Consultation", chair: "1" },
              ].map((slot) => (
                <div key={slot.time} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{slot.patient}</p>
                    <p className="text-[11.5px] text-muted-foreground">{slot.type} · Chair {slot.chair}</p>
                  </div>
                  <span className="text-[12px] font-semibold tabular-nums text-primary-700">{slot.time}</span>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-foreground">No appointments scheduled</p>
                <p className="mt-1 text-[12px] text-muted-foreground">This team member is not seeing patients today.</p>
              </div>
            )}
            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setScheduleFor(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, role or department..."
            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => (
          <div key={member.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-shadow hover:shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar {...avatarName(member.name)} />
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-foreground">{member.name}</h3>
                  <p className="truncate text-sm text-primary-700">{member.role}</p>
                </div>
              </div>
              <Badge variant={member.status === "Active" ? "success" : "warning"}>{member.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-secondary-50/60 p-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Department</span>
                <p className="font-medium text-foreground/75">{member.department}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Today&apos;s patients</span>
                <p className="font-medium text-foreground/75">{member.todayPatients}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Rating</span>
                <p className="font-medium text-foreground/75">{member.rating ? `${member.rating}/5.0` : "New"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Schedule</span>
                <button
                  onClick={() => setScheduleFor(member)}
                  className="inline-flex items-center gap-1 font-medium text-primary-700 hover:text-primary-800"
                >
                  <Calendar className="h-3.5 w-3.5" /> View
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm font-medium text-foreground">No staff match "{search}"</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Try a different name, role or department.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
