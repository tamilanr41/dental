import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquareText,
  Mic,
  ScanLine,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations/ScrollReveal";
import { CTASection } from "@/components/home/CTASection";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const aiFeatures = [
  { icon: Bot, title: "AI dental assistant", description: "A 24/7 assistant that answers questions, schedules visits and sends aftercare instructions." },
  { icon: Brain, title: "Smart triage", description: "Symptom analysis that prioritises urgency and prepares your visit before you arrive." },
  { icon: FileText, title: "Treatment plan generator", description: "Personalised plans with timelines, costs and predicted outcomes based on your scans." },
  { icon: ScanLine, title: "Imaging assistant", description: "AI-highlighted X-rays and 3D scans, with changes tracked over time." },
  { icon: Smile, title: "Smile simulator", description: "See a photorealistic preview of your result before a single tool is picked up." },
  { icon: Mic, title: "Voice-to-notes", description: "Hands-free clinical notes that transcribe and file themselves into your record." },
  { icon: Clock, title: "Follow-up automation", description: "Right-timed check-ins by SMS, email or WhatsApp — fewer no-shows, better recovery." },
  { icon: ShieldCheck, title: "Compliance & audit", description: "Continuous HIPAA monitoring, audit logging and threat detection across the platform." },
];

const quickQuestions = [
  "What should I do after a tooth extraction?",
  "How long does teeth whitening take?",
  "Do dental implants hurt?",
  "What's the cost of Invisalign?",
  "How often should I get a checkup?",
];

const demoResponses: Record<string, string> = {
  "What should I do after a tooth extraction?": "After a tooth extraction, rest for 24 hours, avoid rinsing or spitting, apply ice packs for swelling, eat soft foods, and take prescribed pain medication as directed. Avoid straws and smoking for at least 48 hours. Contact us immediately if bleeding persists.",
  "How long does teeth whitening take?": "Professional in-office whitening takes about 60–90 minutes and shows results immediately. Take-home kits typically require 1–2 weeks of daily 30-minute applications for optimal results. Our AI can predict your final shade before you start!",
  "Do dental implants hurt?": "Most patients report minimal discomfort. The procedure is performed under local anesthesia, so you won't feel pain during surgery. Post-procedure soreness is typically mild and managed with over-the-counter pain relievers for 2–3 days.",
  "What's the cost of Invisalign?": "Invisalign treatment ranges from ₹25,000–₹1,50,000 depending on complexity and duration. We offer payment plans starting at ₹4,999/month. Book a consultation and our AI will generate a precise quote with your insurance coverage included.",
  "How often should I get a checkup?": "We recommend bi-annual checkups every 6 months. However, our AI triage system may suggest more frequent visits based on your risk factors — including genetics, oral hygiene habits, and medical history.",
};

const phases = [
  {
    step: "01",
    title: "Before your visit",
    items: ["AI symptom triage & urgency scoring", "Smart appointment scheduling", "Pre-visit questionnaire automation", "Insurance verification"],
  },
  {
    step: "02",
    title: "During your visit",
    items: ["AI-assisted X-ray analysis", "Real-time treatment planning", "Voice-to-notes documentation", "Smile simulation preview"],
  },
  {
    step: "03",
    title: "After your visit",
    items: ["Automated follow-up messages", "Recovery progress tracking", "Medication reminders", "AI-powered satisfaction survey"],
  },
];

export default function AIFeaturesPage() {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I'm the Sri Saraswathi AI assistant. Ask me anything about dental care or our services!" },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    setTimeout(() => {
      const matchedQuestion = Object.keys(demoResponses).find(
        (q) => q.toLowerCase() === userMsg.toLowerCase()
      );
      const matchedKey = Object.keys(demoResponses).find((q) =>
        userMsg.toLowerCase().includes(q.toLowerCase().slice(0, 20))
      );
      const response = matchedQuestion
        ? demoResponses[matchedQuestion]
        : matchedKey
          ? demoResponses[matchedKey]
          : "Thanks for your question! Our AI is analysing the best response. For immediate assistance, please call 0424 427 2494 or book an appointment.";
      setChatMessages((prev) => [...prev, { role: "ai", text: response }]);
      setChatLoading(false);
    }, 1000);
  };

  const askQuick = (q: string) => {
    setChatMessages((prev) => [...prev, { role: "user", text: q }]);
    setChatLoading(true);
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: demoResponses[q] || "Let me look that up for you…" },
      ]);
      setChatLoading(false);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        tone="ink"
        align="center"
        eyebrow="AI platform"
        title={
          <>
            Eight modules. <span className="italic text-primary-300">One calmer visit.</span>
          </>
        }
        description="From the first symptom to the final follow-up, the Sri Saraswathi platform works quietly in the background so your clinician can focus entirely on you."
        actions={
          <>
            <Button asChild size="lg" className="bg-white text-ink-950 hover:bg-primary-50">
              <Link to="/booking">
                Book a visit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-white/80 transition-all hover:border-white/35 hover:text-white"
            >
              Try the assistant
            </a>
          </>
        }
      />

      {/* Feature grid */}
      <section className="section-pad">
        <div className="container-x">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> What&apos;s inside
                </span>
                <h2 className="mt-5 text-display-2 text-balance">
                  The operating system behind your <span className="italic text-primary-700">care</span>
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> HIPAA-compliant by design
              </span>
            </div>
          </ScrollReveal>

          <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aiFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <div className="group h-full rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-medium leading-snug text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Chat demo */}
      <section id="demo" className="section-pad border-y border-border/60 bg-secondary-50/60">
        <div className="container-x">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <ScrollReveal>
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> Try it now
                </span>
                <h2 className="mt-5 text-display-2 text-balance">
                  Ask the assistant <span className="italic text-primary-700">anything</span>
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  A live demo of the triage assistant. Type a question, or start with one of
                  these — responses are pre-written for illustration.
                </p>
              </ScrollReveal>

              <div className="mt-7 flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => askQuick(q)}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-700 hover:shadow-soft"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-[12px] font-semibold text-amber-900">AI disclaimer</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-amber-900/70">
                    Our AI assists — never replaces — professional diagnosis. Always consult a
                    licensed dentist for medical decisions.
                  </p>
                </div>
              </div>
            </div>

            <ScrollReveal direction="right" delay={0.1}>
              <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card">
                <div className="flex items-center gap-3 border-b border-border/70 bg-secondary-50/60 px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-foreground">Saraswathi AI Assistant</p>
                    <p className="text-[11px] text-muted-foreground">Online · replies instantly</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Active
                  </span>
                </div>

                <div ref={scrollRef} className="h-[380px] space-y-3 overflow-y-auto p-5">
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                          msg.role === "user"
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-secondary-50 text-foreground/85"
                        )}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {chatLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-sm bg-secondary-50 px-4 py-3">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/30" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/25 [animation-delay:120ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/20 [animation-delay:240ms]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="border-t border-border/70 p-4">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1.5 pl-4">
                    <MessageSquareText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask a dental question…"
                      className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      aria-label="Send message"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary-800 disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-pad">
        <div className="container-x">
          <ScrollReveal>
            <div className="max-w-2xl">
              <span className="eyebrow">
                <span className="eyebrow-dot" /> How it works
              </span>
              <h2 className="mt-5 text-display-2 text-balance">
                Three phases, <span className="italic text-primary-700">silently handled</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {phases.map((phase, i) => (
              <ScrollReveal key={phase.step} delay={i * 0.08}>
                <div className="group h-full rounded-2xl border border-border/70 bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 font-display text-[13px] text-white">
                      {phase.step}
                    </span>
                    <Stethoscope className="h-4 w-4 text-border transition-colors group-hover:text-primary-400" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium text-foreground">
                    {phase.title}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {phase.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
