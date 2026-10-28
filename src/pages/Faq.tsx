import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageCircle, Minus, Plus, Search } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";

const faqs = [
  {
    category: "Appointments",
    items: [
      { q: "How do I book an appointment?", a: "You can book online through our website in under 60 seconds. Click the 'Book Appointment' button, select your preferred date, time, and dentist, and we'll confirm your slot instantly via SMS and email." },
      { q: "Can I reschedule or cancel an appointment?", a: "Yes, you can reschedule or cancel online through the Patient Portal. We ask for at least 24 hours notice for non-emergency appointments." },
      { q: "Do you accept walk-ins?", a: "We prioritize scheduled appointments, but we do accept walk-ins based on availability. For faster service, we recommend booking online." },
      { q: "What should I bring to my first appointment?", a: "Please bring your ID, insurance card, a list of current medications, and any previous dental X-rays if available." },
    ],
  },
  {
    category: "Insurance & Payments",
    items: [
      { q: "What insurance plans do you accept?", a: "We accept most major Indian health insurers including Star Health, HDFC ERGO, ICICI Lombard, Niva Bupa and Care Health. Contact us with your policy number to verify your specific plan." },
      { q: "Do you offer payment plans?", a: "Yes. We offer 0% EMI on major credit cards and in-house instalment plans, so treatment can be split into easy monthly payments. Our front desk can help you choose a plan that fits your budget." },
      { q: "What payment methods do you accept?", a: "We accept UPI (GPay, PhonePe, Paytm), RuPay, Visa and Mastercard debit/credit cards, net banking, and cash." },
    ],
  },
  {
    category: "Treatments",
    items: [
      { q: "How often should I visit the dentist?", a: "We recommend every 6 months for routine check-ups and cleanings. Our AI system may suggest more frequent visits based on your oral health profile." },
      { q: "Are dental X-rays safe?", a: "Yes. Our digital X-rays use up to 90% less radiation than traditional film X-rays. We follow ALARA (As Low As Reasonably Achievable) principles." },
      { q: "Does teeth whitening damage enamel?", a: "No, professional teeth whitening is safe when performed under dental supervision. Our AI-optimized formulas protect your enamel while delivering results." },
    ],
  },
  {
    category: "Technology",
    items: [
      { q: "How does AI improve dental care?", a: "Our AI platform assists with early diagnosis, treatment planning, and progress monitoring. It analyzes X-rays, predicts outcomes, and personalizes your care plan." },
      { q: "Is my data secure?", a: "Absolutely. We are HIPAA-compliant and use 256-bit encryption for all patient data. Your information is stored securely and never shared without your consent." },
      { q: "What is digital smile design?", a: "Digital Smile Design uses AI to create a preview of your potential smile makeover. You can see expected results before any treatment begins." },
    ],
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filtered = faqs
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (i) =>
          i.q.toLowerCase().includes(search.toLowerCase()) ||
          i.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        eyebrow="Help centre"
        align="center"
        title={
          <>
            Questions, answered <span className="italic text-primary-700">plainly.</span>
          </>
        }
        description="Appointments, insurance, treatment and the technology behind your care. If it isn't here, our team is one message away."
        actions={
          <div className="relative mx-auto w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-[14px] text-foreground shadow-soft transition-all placeholder:text-muted-foreground/70 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </div>
        }
      />

      <section className="section-pad">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            {filtered.length === 0 && (
              <div className="rounded-3xl border border-border/70 bg-card p-10 text-center shadow-soft">
                <p className="font-display text-2xl font-medium text-foreground">No matches found</p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  Try a different phrase, or ask us directly.
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <Link to="/contact">Contact the team</Link>
                </Button>
              </div>
            )}

            <div className="space-y-12">
              {filtered.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl font-medium text-foreground">
                      {cat.category}
                    </h2>
                    <span className="rounded-full border border-border/80 bg-secondary-50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {cat.items.length}
                    </span>
                  </div>

                  <div className="mt-5 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
                    {cat.items.map((item) => {
                      const key = `${cat.category}-${item.q}`;
                      const isOpen = openKey === key;
                      return (
                        <div key={item.q}>
                          <button
                            type="button"
                            onClick={() => setOpenKey(isOpen ? null : key)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition-colors hover:bg-secondary-50/60 md:px-6"
                          >
                            <span className="text-[15px] font-medium text-foreground">
                              {item.q}
                            </span>
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                isOpen
                                  ? "border-primary-700 bg-primary-700 text-white"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                            </span>
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <p className="px-5 pb-5 pr-12 text-[14px] leading-relaxed text-muted-foreground md:px-6">
                                  {item.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-border/70 bg-secondary-50/70 px-6 py-10 text-center md:flex-row md:justify-between md:text-left">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary-700 shadow-soft">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-medium text-foreground">
                    Still have a question?
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    Our front desk usually replies in under an hour.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/contact">
                  Ask us directly <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
