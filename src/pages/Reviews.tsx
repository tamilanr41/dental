import { useState } from "react";
import { Star, ThumbsUp, Quote } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";

const allReviews = [
  { id: 1, name: "Jessica Martinez", treatment: "Teeth Whitening", rating: 5, content: "I was nervous about teeth whitening, but the AI consultation made me feel completely at ease. The results are incredible! My smile has never looked better.", date: "2 weeks ago", helpful: 24 },
  { id: 2, name: "Robert Kim", treatment: "Dental Implants", rating: 5, content: "The implant procedure was seamless. The 3D treatment planning showed me exactly what to expect. Recovery was faster than I anticipated.", date: "1 month ago", helpful: 18 },
  { id: 3, name: "Amanda Foster", treatment: "Invisalign", rating: 5, content: "Tracking my aligner progress through the patient app is so convenient. My dentist checked in regularly via the AI follow-up system.", date: "3 weeks ago", helpful: 31 },
  { id: 4, name: "David Thompson", treatment: "Root Canal", rating: 4, content: "Dreading a root canal but the sedation options made it painless. The AI-assisted diagnosis was spot on.", date: "2 months ago", helpful: 15 },
  { id: 5, name: "Sarah Lee", treatment: "Braces", rating: 5, content: "My daughter's braces experience was amazing! The staff was so gentle and patient with her. Would highly recommend.", date: "2 months ago", helpful: 22 },
  { id: 6, name: "Michael Brown", treatment: "Check-up & Cleaning", rating: 5, content: "The most thorough dental cleaning I've ever had. The AI system detected an early cavity that other dentists missed.", date: "3 months ago", helpful: 19 },
];

const breakdown = [
  { stars: 5, pct: 92 },
  { stars: 4, pct: 6 },
  { stars: 3, pct: 1.5 },
  { stars: 2, pct: 0.5 },
  { stars: 1, pct: 0 },
];

export default function ReviewsPage() {
  const [sortBy, setSortBy] = useState<"latest" | "highest" | "lowest">("latest");
  const [reviews, setReviews] = useState(allReviews);
  const [helpfulIds, setHelpfulIds] = useState<number[]>([]);
  const [writeOpen, setWriteOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({ name: "", treatment: "Check-up & Cleaning", content: "" });

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === "latest") return 0;
    if (sortBy === "highest") return b.rating - a.rating;
    return a.rating - b.rating;
  });

  const markHelpful = (id: number) => {
    if (helpfulIds.includes(id)) return;
    setHelpfulIds((prev) => [...prev, id]);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r)));
    toast.success("Thanks for the feedback");
  };

  const handleSubmitReview = () => {
    if (!form.name.trim() || !form.content.trim()) {
      toast.error("Please add your name and a short review");
      return;
    }
    setReviews((prev) => [
      {
        id: prev.reduce((max, r) => Math.max(max, r.id), 0) + 1,
        name: form.name.trim(),
        treatment: form.treatment,
        rating,
        content: form.content.trim(),
        date: "Just now",
        helpful: 0,
      },
      ...prev,
    ]);
    toast.success("Thank you — your review has been posted");
    setForm({ name: "", treatment: "Check-up & Cleaning", content: "" });
    setRating(5);
    setWriteOpen(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        eyebrow="Verified reviews"
        title={
          <>
            Two thousand smiles, <span className="italic text-primary-700">in their words.</span>
          </>
        }
        description="Every review below comes from a verified patient after a completed visit. No edits, no cherry-picking."
        actions={
          <Button size="lg" onClick={() => setWriteOpen(true)}>
            <Star className="h-4 w-4" /> Write a review
          </Button>
        }
        aside={
          <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-card backdrop-blur md:p-8">
            <div className="flex items-end gap-4">
              <p className="font-display text-6xl font-medium leading-none tracking-tight text-foreground">
                4.9
              </p>
              <div className="pb-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  Based on 2,000+ verified visits
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              {breakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-3 text-[12px] tabular-nums text-muted-foreground">
                    {row.stars}
                  </span>
                  <Star className="h-3 w-3 fill-muted-foreground/40 text-muted-foreground/40" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary-100">
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <Modal isOpen={writeOpen} onClose={() => setWriteOpen(false)} title="Write a review" description="Share your experience after a verified visit.">
        <div className="space-y-4">
          <Input label="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          <Select
            label="Treatment"
            value={form.treatment}
            onChange={(e) => setForm({ ...form, treatment: e.target.value })}
            options={["Check-up & Cleaning", "Teeth Whitening", "Dental Implants", "Invisalign", "Root Canal", "Braces"].map((t) => ({ value: t, label: t }))}
          />
          <div>
            <span className="mb-1.5 block text-[12px] font-medium text-foreground/80">Rating</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  className="rounded-lg p-1 transition-transform hover:scale-110"
                >
                  <Star className={`h-6 w-6 ${value <= rating ? "fill-amber-400 text-amber-400" : "fill-secondary-200 text-secondary-200"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground/80">Your review</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Tell us about your visit..."
              className="min-h-[110px] w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setWriteOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview}><Star className="h-4 w-4" /> Post review</Button>
          </div>
        </div>
      </Modal>

      <section className="section-pad">
        <div className="container-x">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex rounded-full border border-border/80 bg-card p-1 shadow-soft">
                {(["latest", "highest", "lowest"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${
                      sortBy === s
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-muted-foreground">
                Showing {sorted.length} of {reviews.length} recent reviews
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {sorted.map((review) => (
                <article
                  key={review.id}
                  className="group flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-[12px] font-semibold text-primary-700">
                        {review.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-foreground">{review.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {review.treatment} · {review.date}
                        </p>
                      </div>
                    </div>
                    <Quote className="h-5 w-5 shrink-0 text-primary-200 transition-colors group-hover:text-primary-300" />
                  </div>

                  <div className="mt-4 flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-secondary-200 text-secondary-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-3 flex-1 text-pretty text-[14px] leading-relaxed text-foreground/80">
                    {review.content}
                  </p>

                  <div className="mt-5 border-t border-border/60 pt-3">
                    <button
                      onClick={() => markHelpful(review.id)}
                      disabled={helpfulIds.includes(review.id)}
                      className={`flex items-center gap-1.5 text-[12px] transition-colors ${
                        helpfulIds.includes(review.id)
                          ? "text-primary-700"
                          : "text-muted-foreground hover:text-primary-700"
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${helpfulIds.includes(review.id) ? "fill-primary-100" : ""}`} />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
