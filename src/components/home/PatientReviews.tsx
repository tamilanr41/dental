"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Star, Quote, Play } from "lucide-react";

const reviews = [
  {
    name: "Sarah Johnson",
    text: "The AI triage saved me so much time. I described my symptoms online and they were ready for me when I arrived. Incredible experience!",
    rating: 5,
    treatment: "Teeth Whitening",
    avatar: "SJ",
    color: "bg-primary",
  },
  {
    name: "Michael Chen",
    text: "I was terrified of dentists. The AI assistant answered all my questions and the team made me feel completely at ease. Life-changing results.",
    rating: 5,
    treatment: "Dental Implants",
    avatar: "MC",
    color: "bg-primary",
  },
  {
    name: "Meena Rajan",
    text: "My smile makeover exceeded every expectation. The before/after simulation helped me visualize everything before we started. State-of-the-art!",
    rating: 5,
    treatment: "Smile Makeover",
    avatar: "MR",
    color: "bg-primary",
  },
  {
    name: "James Wilson",
    text: "Same-day crown? Unbelievable. Their digital workflow is so efficient. In and out in 2 hours with a perfect-fitting crown.",
    rating: 5,
    treatment: "Crowns & Bridges",
    avatar: "JW",
    color: "bg-primary",
  },
  {
    name: "Priya Patel",
    text: "The follow-up care is amazing. The AI checked on me after my procedure and the team called personally the next day. They truly care.",
    rating: 5,
    treatment: "Root Canal",
    avatar: "PP",
    color: "bg-primary",
  },
  {
    name: "David Kim",
    text: "My kids actually look forward to going to the dentist now! The pediatric team is wonderful and the technology keeps them engaged.",
    rating: 5,
    treatment: "Pediatric Dentistry",
    avatar: "DK",
    color: "bg-primary",
  },
];

export function PatientReviews() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="section-pad relative overflow-hidden bg-secondary-50/60">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-dots opacity-[0.35] mask-fade-b" />
        <div className="absolute left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-primary-100/40 blur-[120px]" />
      </div>

      <div className="container-x relative">
        <ScrollReveal>
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <p className="eyebrow justify-center">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              4.9 average · 2,000+ reviews
            </p>
            <h2 className="mt-4 text-display-2 text-balance text-foreground">
              Real smiles, <span className="italic text-primary-700">real words</span>.
            </h2>
            <p className="mt-4 text-pretty text-[16px] leading-relaxed text-muted-foreground">
              Tap a card to read the full story — unedited, from patients at this practice.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => {
            const isExpanded = expanded === review.name;

            return (
              <ScrollReveal key={review.name} direction="up" delay={i * 0.06}>
                <motion.div
                  layout
                  className={`group relative h-full cursor-pointer rounded-2xl border p-6 transition-all duration-300 ${
                    isExpanded
                      ? "border-primary-300 bg-card shadow-card"
                      : "border-border/70 bg-card/80 backdrop-blur-sm hover:-translate-y-1 hover:border-primary-200 hover:shadow-card"
                  }`}
                  onClick={() => setExpanded(isExpanded ? null : review.name)}
                >
                  <Quote className="absolute right-5 top-5 h-7 w-7 text-primary-700/15" />
                  <div className="mb-3 flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className={`text-[14px] leading-relaxed text-secondary-700 transition-all ${
                    isExpanded ? "" : "line-clamp-3"
                  }`}>
                    &ldquo;{review.text}&rdquo;
                  </p>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/70 bg-secondary-50 p-3" data-cursor="Play">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-white">
                            <Play className="h-3.5 w-3.5 fill-current" />
                          </span>
                          <div>
                            <p className="text-xs font-medium text-foreground">Video testimonial</p>
                            <p className="text-[10px] text-muted-foreground">Watch {review.name}&apos;s full story</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-semibold ${review.color} text-white shadow-soft`}>
                      {review.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.treatment}</p>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
