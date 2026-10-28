import { useState } from "react";
import { Download, Eye, FileImage, FileText, Pill, Upload } from "lucide-react";
import { PortalHeader } from "@/components/patient-portal/PortalHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";

type RecordType = "X-Ray" | "Treatment Plan" | "Lab Report" | "Prescription" | "Invoice" | "Photo";

type RecordItem = {
  id: number;
  name: string;
  date: string;
  type: RecordType;
  size: string;
};

const initialRecords: RecordItem[] = [
  { id: 1, name: "Dental X-rays - Full Series", date: "Jun 15, 2026", type: "X-Ray", size: "2.4 MB" },
  { id: 2, name: "Treatment Plan - Implant", date: "May 20, 2026", type: "Treatment Plan", size: "1.1 MB" },
  { id: 3, name: "Lab Report - Crown Fabrication", date: "May 10, 2026", type: "Lab Report", size: "0.8 MB" },
  { id: 4, name: "Prescription - Amoxicillin", date: "Apr 22, 2026", type: "Prescription", size: "0.3 MB" },
  { id: 5, name: "Invoice - Teeth Whitening", date: "Mar 22, 2026", type: "Invoice", size: "0.5 MB" },
  { id: 6, name: "Intraoral Photos - Before Treatment", date: "Mar 15, 2026", type: "Photo", size: "4.2 MB" },
];

const recordTypes: RecordType[] = ["X-Ray", "Treatment Plan", "Lab Report", "Prescription", "Invoice", "Photo"];

function RecordIcon({ type }: { type: string }) {
  if (type === "X-Ray" || type === "Photo") return <FileImage className="h-[18px] w-[18px]" />;
  if (type === "Prescription") return <Pill className="h-[18px] w-[18px]" />;
  return <FileText className="h-[18px] w-[18px]" />;
}

const downloadRecord = (record: RecordItem) => {
  const content = [
    "Sri Saraswathi Dental Clinic — Patient record",
    "",
    `Record: ${record.name}`,
    `Type: ${record.type}`,
    `Date: ${record.date}`,
    `Size: ${record.size}`,
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${record.name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-")}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloading ${record.name}`);
};

export default function PatientRecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>(initialRecords);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState<RecordItem | null>(null);
  const [form, setForm] = useState<{ name: string; type: RecordType; file: string; size: string }>({
    name: "",
    type: "X-Ray",
    file: "",
    size: "",
  });

  const handleUpload = () => {
    if (!form.name.trim()) {
      toast.error("Please enter a record name");
      return;
    }
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    setRecords((prev) => [
      {
        id: prev.reduce((max, r) => Math.max(max, r.id), 0) + 1,
        name: form.name.trim(),
        date: today,
        type: form.type,
        size: form.size || "—",
      },
      ...prev,
    ]);
    toast.success(`${form.name} uploaded`);
    setForm({ name: "", type: "X-Ray", file: "", size: "" });
    setUploadOpen(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <PortalHeader
        eyebrow="Patient portal"
        title="My records"
        description="X-rays, reports, prescriptions and invoices — all in one archive."
        actions={
          <Button size="lg" variant="outline" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" /> Upload record
          </Button>
        }
      />

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload record" description="Add a document to your personal health archive.">
        <div className="space-y-4">
          <Input label="Record name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dental X-ray - Lower jaw" />
          <Select
            label="Record type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as RecordType })}
            options={recordTypes.map((t) => ({ value: t, label: t }))}
          />
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground/80">Attach file (optional)</label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setForm((prev) => ({
                  ...prev,
                  name: prev.name || (file ? file.name.replace(/\.[^.]+$/, "") : prev.name),
                  file: file?.name ?? "",
                  size: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : prev.size,
                }));
              }}
              className="block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[12px] text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary-50 file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-primary-700"
            />
            {form.file && <p className="mt-1.5 text-[11px] text-muted-foreground">Selected: {form.file} · {form.size}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload}><Upload className="h-4 w-4" /> Upload</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!preview} onClose={() => setPreview(null)} title={preview?.name ?? "Record preview"} description="Read-only view from your health archive.">
        {preview && (
          <div className="space-y-4">
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-border/70 bg-secondary-50/50 p-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <RecordIcon type={preview.type} />
              </span>
              <div>
                <p className="text-[13px] font-medium text-foreground">{preview.name}</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">{preview.date} · {preview.size}</p>
              </div>
              <Badge variant="info">{preview.type}</Badge>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
              <Button onClick={() => downloadRecord(preview)}><Download className="h-4 w-4" /> Download</Button>
            </div>
          </div>
        )}
      </Modal>

      <section className="container-x py-10 md:py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-all hover:shadow-card"
            >
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <RecordIcon type={record.type} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-foreground">{record.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {record.date} · {record.type} · {record.size}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => setPreview(record)}
                  aria-label={`Preview ${record.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => downloadRecord(record)}
                  aria-label={`Download ${record.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
