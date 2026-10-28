import { ClipboardList, CheckCircle, Clock } from "lucide-react";
import { PortalHeader } from "@/components/patient-portal/PortalHeader";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

const treatments = [
  { id: 1, name: "Teeth Whitening", status: "Completed", progress: 100, startDate: "Mar 22, 2026", endDate: "Mar 22, 2026" },
  { id: 2, name: "Invisalign Treatment", status: "In Progress", progress: 65, startDate: "Apr 10, 2026", endDate: "Dec 2026 (est.)", steps: "18/28 aligners" },
  { id: 3, name: "Dental Implant - Tooth #19", status: "Planned", progress: 0, startDate: "Aug 2026 (est.)", endDate: "Nov 2026 (est.)" },
];

export default function PatientTreatmentsPage() {
  return (
    <main className="min-h-screen bg-background">
      <PortalHeader
        eyebrow="Patient portal"
        title="My treatments"
        description="Track progress across every plan, from first consultation to final review."
      />

      <section className="container-x py-10 md:py-12">
        <div className="space-y-4">
          {treatments.map((tx) => (
            <div
              key={tx.id}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:shadow-card md:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      tx.status === "Completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : tx.status === "In Progress"
                          ? "bg-primary-50 text-primary-700"
                          : "bg-secondary-100 text-muted-foreground"
                    }`}
                  >
                    {tx.status === "Completed" ? (
                      <CheckCircle className="h-[18px] w-[18px]" />
                    ) : (
                      <ClipboardList className="h-[18px] w-[18px]" />
                    )}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">{tx.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {tx.startDate} – {tx.endDate}
                      </span>
                      {tx.steps && <span>{tx.steps}</span>}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    tx.status === "Completed"
                      ? "success"
                      : tx.status === "In Progress"
                        ? "info"
                        : "default"
                  }
                >
                  {tx.status}
                </Badge>
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium tabular-nums text-foreground/80">{tx.progress}%</span>
                </div>
                <Progress value={tx.progress} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
