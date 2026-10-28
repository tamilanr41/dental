"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Bot, Mic, Send, Sparkles, Brain, BarChart3, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import { cn } from "@/lib/utils";

const aiMessages = [
  { role: "ai", text: "Hello! I'm your Sri Saraswathi AI assistant. How can I help you today?" },
  { role: "user", text: "What treatments do you recommend for stained teeth?" },
  { role: "ai", text: "Based on your symptoms, I'd recommend our professional teeth whitening treatment. It's AI-powered with custom shade matching. Would you like to see a simulation?" },
  { role: "user", text: "Yes, please show me!" },
  { role: "ai", text: "Great choice! I'm generating your personalized smile preview now. Meanwhile, here's what to expect:" },
];

const recommendations = [
  { label: "Teeth Whitening", time: "60 min", price: "₹8,000", match: "96% match" },
  { label: "Porcelain Veneers", time: "2 visits", price: "₹18,000", match: "88% match" },
  { label: "Composite Bonding", time: "45 min", price: "₹4,500", match: "82% match" },
];

export function AiWorkspace() {
  const [visibleMsgs, setVisibleMsgs] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [showRecs, setShowRecs] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [extraMessages, setExtraMessages] = useState<{ role: string; text: string }[]>([]);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBarHeights(Array.from({ length: 40 }, () => Math.random() * 60 + 10));
  }, []);
  const { isLowEnd } = useDeviceDetect();

  useEffect(() => {
    if (visibleMsgs >= aiMessages.length) {
      setTimeout(() => setShowRecs(true), 500);
      return;
    }
    const timeout = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setVisibleMsgs((v) => v + 1);
      }, 800);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [visibleMsgs]);

  useEffect(() => {
    // Scroll only inside the chat box itself, never the page. Using
    // scrollIntoView() here was the cause of the whole site auto-scrolling
    // away from the Hero on load: since this section sits below the fold,
    // the browser dragged the entire window down to reveal it.
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [visibleMsgs, isTyping, extraMessages.length]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setExtraMessages((prev) => [...prev, { role: "user", text }]);
    setDraft("");
    setShowRecs(true);
    setTimeout(() => {
      setExtraMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Thanks for sharing that. A 30-minute consultation is the best next step — you can book instantly with the button below.",
        },
      ]);
    }, 900);
  };

  useEffect(() => {
    if (!waveformRef.current || isLowEnd || barHeights.length === 0) return;
    const bars = waveformRef.current.querySelectorAll(".wave-bar");
    if (bars.length === 0) return;
    gsap.to(bars, {
      scaleY: () => Math.random() * 1.5 + 0.3,
      duration: 0.4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.05,
    });
  }, [isLowEnd, barHeights]);

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-[0.16]" />
        <div className="absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-primary-500/15 blur-[120px]" />
        <div className="absolute -bottom-40 left-0 h-[460px] w-[460px] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div className="container-x relative">
        <ScrollReveal>
          <div className="mb-12 text-center md:mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60 backdrop-blur">
              <Brain className="h-3.5 w-3.5 text-accent-300" /> AI-powered intelligence
            </span>
            <h2 className="mx-auto mt-6 max-w-3xl text-display-2 text-balance text-white">
              A clinical copilot that <span className="italic text-primary-300">listens</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-[16px] leading-relaxed text-white/55">
              Ask questions in plain language. Get treatment options, voice-dictated notes and
              a smile preview — before you even sit in the chair.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* AI Chat Interface */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-lift backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Saraswathi AI</p>
                  <p className="text-xs text-white/50">Powered by GPT-4o · Always learning</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400/80">Active</span>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatScrollRef} className="h-[320px] overflow-y-auto p-5 space-y-4">
                {[...aiMessages.slice(0, visibleMsgs), ...extraMessages].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-white/10 bg-white/[0.07] text-white/85"
                    )}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-white/40" />
                        <span className="h-2 w-2 rounded-full bg-white/30" />
                        <span className="h-2 w-2 rounded-full bg-white/20" />
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Recommendation cards */}
              <AnimatePresence>
                {showRecs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-medium text-white/60 uppercase tracking-wider px-1">AI Recommendations</p>
                      {recommendations.map((rec, i) => (
                        <motion.div
                          key={rec.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">{rec.label}</p>
                            <p className="text-xs text-white/45">{rec.time} · {rec.price}</p>
                          </div>
                          <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-medium text-emerald-300">{rec.match}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="border-t border-white/10 p-4">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => setIsListening(!isListening)}
                    aria-label={isListening ? "Stop listening" : "Start voice input"}
                    className={cn("transition-all", isListening ? "text-accent" : "text-white/40 hover:text-white/70")}
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Ask about treatments, symptoms, or pricing..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    className="text-white/40 transition-all hover:text-white/70"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-2 px-1 text-[10px] text-white/25">
                  Demo assistant · not a substitute for clinical advice
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Voice waveform + features */}
          <ScrollReveal direction="right" delay={0.3}>
            <div className="space-y-6">
              {/* Voice waveform */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Mic className="h-5 w-5 text-primary-300" />
                  <p className="text-sm font-medium text-white">Voice-to-Notes Demo</p>
                </div>
                <div ref={waveformRef} className="flex items-end gap-[2px] sm:gap-[3px] h-12 sm:h-16 overflow-hidden">
                  {barHeights.length === 0 && (
                    <div className="flex items-end gap-[2px] sm:gap-[3px] h-full">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="w-[4px] sm:w-[6px] bg-gradient-to-t from-secondary-400 to-primary-400 rounded-full" style={{ height: `${(i % 5 + 2) * 10}%` }} />
                      ))}
                    </div>
                  )}
                  {barHeights.map((h, i) => (
                    <div
                      key={i}
                      className="wave-bar w-[4px] sm:w-[6px] bg-gradient-to-t from-secondary-400 to-primary-400 rounded-full"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/40 text-center">Live voice analysis — try saying &ldquo;Book an appointment&rdquo;</p>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Sparkles, label: "Treatment Plans", desc: "AI-generated in seconds" },
                  { icon: BarChart3, label: "Predictive Analytics", desc: "98.7% accuracy" },
                  { icon: FileText, label: "Auto Documentation", desc: "HIPAA compliant" },
                  { icon: Brain, label: "Smile Simulation", desc: "Preview your results" },
                ].map((f) => (
                  <div key={f.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                    <f.icon className="mb-2 h-5 w-5 text-primary-300" />
                    <p className="text-sm font-medium text-white">{f.label}</p>
                    <p className="text-xs text-white/50">{f.desc}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/ai-features"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold text-ink-950 shadow-lg transition-all hover:-translate-y-0.5 sm:text-sm"
              >
                Explore All AI Features <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
