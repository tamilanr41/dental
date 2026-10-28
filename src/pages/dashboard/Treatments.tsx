import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/Progress";
import toast from "react-hot-toast";
import { Plus, ClipboardList, Activity } from "lucide-react";

type TreatmentStatus = "Planned" | "In Progress" | "Completed";

type Treatment = {
  id: number;
  patient: string;
  plan: string;
  provider: string;
  start: string;
  status: TreatmentStatus;
  progress: number;
  cost: number;
};

const initialTreatments: Treatment[] = [
  { id: 1, patient: "Jessica Martinez", plan: "Teeth Whitening", provider: "Dr. Johnson", start: "Mar 22, 2026", status: "Completed", progress: 100, cost: 8000 },
  { id: 2, patient: "Robert Kim", plan: "Dental Implant #19", provider: "Dr. Chen", start: "Jun 10, 2026", status: "In Progress", progress: 35, cost: 35000 },
  { id: 3, patient: "Amanda Foster", plan: "Invisalign Treatment", provider: "Dr. Johnson", start: "Apr 10, 2026", status: "In Progress", progress: 65, cost: 45000 },
  { id: 4, patient: "David Thompson", plan: "Root Canal #14", provider: "Dr. Williams", start: "Jul 5, 2026", status: "Planned", progress: 0, cost: 9000 },
  { id: 5, patient: "Sarah Lee", plan: "Braces", provider: "Dr. Rodriguez", start: "Feb 15, 2026", status: "In Progress", progress: 45, cost: 55000 },
];

const filters = ["All", "In Progress", "Planned", "Completed"] as const;
type Filter = (typeof filters)[number];

export default function TreatmentsPage() {
  const [txOpen, setTxOpen] = useState(false);
  const [txForm, setTxForm] = useState({ patient: "", plan: "", provider: "Dr. Johnson", cost: "" });
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments);
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(
    () => (filter === "All" ? treatments : treatments.filter((t) => t.status === filter)),
    [treatments, filter],
  );

  const totalValue = treatments.reduce((sum, t) => sum + t.cost, 0);

  const handleNewTreatment = () => {
    const cost = Number(txForm.cost);
    if (!txForm.patient.trim() || !txForm.plan.trim() || !txForm.cost || Number.isNaN(cost) || cost <= 0) {
      toast.error("Please fill in all required fields with a valid amount");
      return;
    }
    const nextId = treatments.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    setTreatments((prev) => [
      {
        id: nextId,
        patient: txForm.patient.trim(),
        plan: txForm.plan.trim(),
        provider: txForm.provider,
        start: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: "Planned",
        progress: 0,
        cost,
      },
      ...prev,
    ]);
    toast.success(`Treatment plan "${txForm.plan}" created for ${txForm.patient}`);
    setTxForm({ patient: "", plan: "", provider: "Dr. Johnson", cost: "" });
    setFilter("All");
    setTxOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> Clinic workspace</span>
          <h1 className="mt-3 text-display-3 text-foreground">Treatment Plans</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">Multi-stage treatment plans with progress tracking.</p>
        </div>
        <Button onClick={() => setTxOpen(true)}><Plus className="h-4 w-4" /> New Treatment Plan</Button>
      </div>

      <Modal isOpen={txOpen} onClose={() => setTxOpen(false)} title="New Treatment Plan" description="Create a new treatment plan for a patient." size="lg">
        <div className="space-y-4">
          <Input label="Patient Name" required value={txForm.patient} onChange={(e) => setTxForm({ ...txForm, patient: e.target.value })} placeholder="Full name" />
          <Input label="Treatment Plan Name" required value={txForm.plan} onChange={(e) => setTxForm({ ...txForm, plan: e.target.value })} placeholder="e.g. Invisalign Treatment" />
          <Select
            label="Provider"
            value={txForm.provider}
            onChange={(e) => setTxForm({ ...txForm, provider: e.target.value })}
            options={[
              { value: "Dr. Johnson", label: "Dr. Johnson" },
              { value: "Dr. Chen", label: "Dr. Chen" },
              { value: "Dr. Williams", label: "Dr. Williams" },
              { value: "Dr. Rodriguez", label: "Dr. Rodriguez" },
            ]}
          />
          <Input label="Estimated Cost (₹)" type="number" min={0} required value={txForm.cost} onChange={(e) => setTxForm({ ...txForm, cost: e.target.value })} placeholder="0" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setTxOpen(false)}>Cancel</Button>
            <Button onClick={handleNewTreatment}><Activity className="h-4 w-4" /> Create Plan</Button>
          </div>
        </div>
      </Modal>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const count = f === "All" ? treatments.length : treatments.filter((t) => t.status === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                active
                  ? "border-primary-700 bg-primary-700 text-white"
                  : "border-border/70 bg-card text-foreground/70 hover:border-primary-300 hover:text-primary-800"
              }`}
            >
              {f} <span className={active ? "text-white/60" : "text-muted-foreground"}>{count}</span>
            </button>
          );
        })}
        <span className="ml-auto hidden text-[12px] text-muted-foreground sm:block">
          Pipeline value <span className="font-semibold text-foreground">₹{totalValue.toLocaleString("en-IN")}</span>
        </span>
      </div>

      <div className="space-y-4">
        {filtered.map((tx) => (
          <div key={tx.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{tx.plan}</h3>
                  <p className="text-sm text-muted-foreground">{tx.patient} • {tx.provider}</p>
                  <p className="text-sm text-muted-foreground">Started: {tx.start} • Cost: ₹{tx.cost.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <Badge variant={
                tx.status === "Completed" ? "success" :
                tx.status === "In Progress" ? "info" :
                "default"
              }>{tx.status}</Badge>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground/75">{tx.progress}%</span>
              </div>
              <Progress value={tx.progress} variant={tx.status === "Completed" ? "success" : "default"} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">No {filter.toLowerCase()} treatment plans</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Create a plan or switch to another filter.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
