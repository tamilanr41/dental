import { useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, DollarSign, Download, ShieldCheck, Wallet } from "lucide-react";
import { PortalHeader } from "@/components/patient-portal/PortalHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

const initialInvoices = [
  { id: "INV-2026-001", date: "Jun 15, 2026", description: "Teeth Whitening - Complete", amount: 8500, paid: 8500, status: "Paid" },
  { id: "INV-2026-002", date: "May 20, 2026", description: "Consultation & X-rays", amount: 1200, paid: 0, status: "Pending" },
  { id: "INV-2026-003", date: "Apr 10, 2026", description: "Invisalign - Initial Payment", amount: 35000, paid: 35000, status: "Paid" },
  { id: "INV-2026-004", date: "Mar 22, 2026", description: "Filling - Tooth #19", amount: 2500, paid: 2500, status: "Paid" },
];

const summary = [
  { label: "Total paid", value: "₹46,000", tone: "text-emerald-700", tile: "bg-emerald-50 text-emerald-600" },
  { label: "Insurance coverage", value: "₹18,000", tone: "text-primary-700", tile: "bg-primary-50 text-primary-700" },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function downloadInvoice(inv: (typeof initialInvoices)[number]) {
  const lines = [
    "Sri Saraswathi Dental Clinic — Invoice",
    "866, Soli Complex, Surampatti Four Rd, Erode 638009 · 0424 427 2494",
    "",
    `Invoice: ${inv.id}`,
    `Date: ${inv.date}`,
    `Treatment: ${inv.description}`,
    `Amount: ${inr(inv.amount)}`,
    `Paid: ${inr(inv.paid)}`,
    `Balance: ${inr(inv.amount - inv.paid)}`,
    `Status: ${inv.status}`,
    "",
    "Thank you for choosing Sri Saraswathi Dental Clinic.",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${inv.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PatientBillingPage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const totalPending = invoices
    .filter((i) => i.status === "Pending")
    .reduce((s, i) => s + i.amount - i.paid, 0);

  const handlePay = () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }
    if (amt > totalPending) {
      toast.error(`Amount cannot exceed the pending balance of ${inr(totalPending)}`);
      return;
    }
    setInvoices((current) => {
      let remaining = amt;
      return current.map((inv) => {
        if (inv.status !== "Pending" || remaining <= 0) return inv;
        const due = inv.amount - inv.paid;
        const applied = Math.min(due, remaining);
        remaining -= applied;
        const paid = inv.paid + applied;
        return { ...inv, paid, status: paid >= inv.amount ? "Paid" : "Pending" };
      });
    });
    toast.success(`Payment of ${inr(amt)} processed successfully!`);
    setPayAmount("");
    setPayOpen(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <PortalHeader
        eyebrow="Patient portal"
        title="Billing & payments"
        description="Invoices, receipts and your outstanding balance — all in one place."
        actions={
          <Button size="lg" onClick={() => setPayOpen(true)}>
            <CreditCard className="h-4 w-4" /> Pay now
          </Button>
        }
      />

      <section className="container-x py-10 md:py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-ink-950 p-6 text-white shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                Pending balance
              </p>
              <Wallet className="h-4 w-4 text-accent-300" />
            </div>
            <p className="mt-3 font-display text-4xl font-medium tracking-tight">
              {inr(totalPending)}
            </p>
            <p className="mt-1 text-[11px] text-white/40">Due by Aug 1, 2026</p>
          </div>

          {summary.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {s.label}
                </p>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.tile}`}>
                  <DollarSign className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className={`mt-3 font-display text-3xl font-medium tracking-tight ${s.tone}`}>
                {s.value}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Year to date</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-medium text-foreground">Invoices</h2>
            <span className="text-[12px] text-muted-foreground">{invoices.length} total</span>
          </div>

          <div className="mt-4 space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-shadow hover:shadow-card sm:flex-row sm:items-center sm:justify-between md:p-5"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <DollarSign className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-foreground">{inv.description}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {inv.id} · {inv.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="text-[14px] font-semibold text-foreground">
                      {inr(inv.amount)}
                    </p>
                    <Badge
                      variant={inv.status === "Paid" ? "success" : "warning"}
                      size="sm"
                      className="mt-1"
                    >
                      {inv.status}
                    </Badge>
                  </div>
                  <button
                    onClick={() => downloadInvoice(inv)}
                    aria-label={`Download ${inv.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary-300 hover:text-primary-700"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Modal
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        title="Make a payment"
        description="Pay your pending balance securely."
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3 text-[13px]">
            <span className="text-primary-800">Pending balance</span>
            <span className="font-semibold text-primary-900">
              {inr(totalPending)}
            </span>
          </div>
          <Input
            label="Payment amount (₹)"
            type="number"
            required
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0"
            min="1"
            max={String(totalPending)}
          />
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-secondary-50/60 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Secured with 256-bit encryption
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePay}>
              <CreditCard className="h-4 w-4" /> Pay ₹{payAmount || "0"}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
