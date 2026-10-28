"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGsap } from "@/lib/animations";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Calendar, Bot, Stethoscope, Heart, Smile, MessageSquareText, Sparkles } from "lucide-react";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";

const steps = [
  { icon: Calendar, label: "Book Online", desc: "60-second booking with AI scheduling" },
  { icon: Bot, label: "AI Triage", desc: "Smart symptom analysis & prep" },
  { icon: Stethoscope, label: "Consultation", desc: "AI-assisted diagnosis" },
  { icon: Sparkles, label: "Treatment", desc: "Precision care with digital workflow" },
  { icon: Heart, label: "Recovery", desc: "AI-tracked healing progress" },
  { icon: MessageSquareText, label: "Follow-up", desc: "Automated check-ins & reminders" },
  { icon: Smile, label: "Smile Complete", desc: "Your perfect smile, delivered" },
];

export function PatientJourney() {
  const [activeStep, setActiveStep] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { isLowEnd } = useDeviceDetect();
  useGsap();

  useEffect(() => {
    if (isLowEnd) return;
    const container = containerRef.current;
    if (!container) return;
    const init = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const stepEls = container.querySelectorAll(".journey-step");
      stepEls.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el as HTMLElement,
          start: "top 70%",
          end: "top 30%",
          onEnter: () => setActiveStep(i),
          onEnterBack: () => setActiveStep(i),
        });
      });
        ScrollTrigger.create({
          trigger: container,
          start: "top 60%",
          end: "bottom 40%",
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.height = `${self.progress * 100}%`;
            }
          },
        });
      });
      return () => ctx.revert();
    };
    init();
  }, [isLowEnd]);

  return (
    <section className="section-pad relative overflow-hidden bg-secondary-50/60">
      <div className="container-x">
        <ScrollReveal>
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <p className="eyebrow justify-center"><span className="eyebrow-dot" />The journey</p>
            <h2 className="mt-4 text-display-2 text-balance text-foreground">
              From first click to your <span className="italic text-primary-700">best smile</span>.
            </h2>
            <p className="mt-4 text-pretty text-[16px] leading-relaxed text-muted-foreground">
              Seven calm steps, each quietly supported by AI — so nothing gets missed and nothing feels rushed.
            </p>
          </div>
        </ScrollReveal>

        <div ref={containerRef} className="relative mx-auto max-w-3xl">
          {/* Progress line */}
          {!isLowEnd && (
            <div className="absolute left-[31px] top-2 bottom-8 w-px bg-border">
              <div ref={progressRef} className="w-full bg-gradient-to-b from-primary-600 to-primary-400 transition-all duration-300 ease-out" style={{ height: "0%" }} />
            </div>
          )}

          <div className="space-y-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i <= activeStep;

              return (
                <motion.div
                  key={step.label}
                  className="journey-step group flex items-start gap-5 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-border/70 hover:bg-card/70"
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <div className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset transition-all duration-500 ${
                    isActive
                      ? "bg-ink-950 text-white ring-ink-900 shadow-[0_14px_30px_-16px_rgba(18,56,72,0.9)]"
                      : "bg-card text-muted-foreground ring-border"
                  }`}>
                    <Icon className="h-6 w-6" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-secondary-50">
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className={`font-display text-[21px] leading-tight transition-colors duration-500 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </h3>
                    <p className={`mt-1 text-sm transition-colors duration-500 ${isActive ? "text-primary-700" : "text-muted-foreground/70"}`}>
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
