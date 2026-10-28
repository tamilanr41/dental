import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Plus, UserCheck } from "lucide-react";
import { PortalHeader } from "@/components/patient-portal/PortalHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const initialMembers = [
  { id: 1, name: "John Doe", relation: "Self", dob: "Jan 15, 1990", nextAppointment: "Jul 15, 2026", status: "Active" as const },
  { id: 2, name: "Sarah Doe", relation: "Spouse", dob: "Mar 22, 1992", nextAppointment: "Aug 10, 2026", status: "Active" as const },
  { id: 3, name: "Emma Doe", relation: "Daughter", dob: "Jun 5, 2018", nextAppointment: "Jul 20, 2026", status: "Active" as const },
  { id: 4, name: "Liam Doe", relation: "Son", dob: "Nov 12, 2020", nextAppointment: "Sep 5, 2026", status: "Active" as const },
];

const relationOptions = [
  { value: "Spouse", label: "Spouse" },
  { value: "Daughter", label: "Daughter" },
  { value: "Son", label: "Son" },
  { value: "Parent", label: "Parent" },
  { value: "Sibling", label: "Sibling" },
];

export default function FamilyPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [members, setMembers] = useState(initialMembers);
  const [form, setForm] = useState({ name: "", relation: "Spouse", dob: "" });

  const handleAdd = () => {
    if (!form.name || !form.dob) {
      toast.error("Please fill in all fields");
      return;
    }
    const newMember = {
      id: Date.now(),
      name: form.name,
      relation: form.relation,
      dob: new Date(form.dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      nextAppointment: "Not scheduled",
      status: "Active" as const,
    };
    setMembers([...members, newMember]);
    toast.success(`${form.name} added to your family!`);
    setForm({ name: "", relation: "Spouse", dob: "" });
    setAddOpen(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <PortalHeader
        eyebrow="Patient portal"
        title="Family members"
        description="Manage appointments and records for everyone under your account."
        actions={
          <Button size="lg" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add member
          </Button>
        }
      />

      <section className="container-x py-10 md:py-12">
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    firstName={member.name.split(" ")[0]}
                    lastName={member.name.split(" ")[1]}
                    size="lg"
                    className="bg-primary-50 text-primary-700"
                  />
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">{member.name}</h3>
                    <p className="mt-0.5 text-[12px] font-medium text-primary-700">
                      {member.relation}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">DOB: {member.dob}</p>
                  </div>
                </div>
                <Badge variant="success">{member.status}</Badge>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary-50/70 px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary-600" />
                  {member.nextAppointment === "Not scheduled"
                    ? "No visit scheduled"
                    : `Next: ${member.nextAppointment}`}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/booking">Book</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add family member"
        description="Link a family member to your account."
      >
        <div className="space-y-4">
          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Jane Doe"
          />
          <Select
            label="Relation"
            required
            options={relationOptions}
            value={form.relation}
            onChange={(e) => setForm({ ...form, relation: e.target.value })}
          />
          <Input
            label="Date of birth"
            type="date"
            required
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>
              <UserCheck className="h-4 w-4" /> Add member
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
