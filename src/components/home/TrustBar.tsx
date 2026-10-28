"use client";

const partners = [
  "Invisalign",
  "Straumann",
  "Nobel Biocare",
  "CEREC",
  "iTero",
  "3Shape",
  "Dentsply Sirona",
  "Itero Element",
];

export function TrustBar() {
  return (
    <section className="relative border-y border-border/70 bg-gradient-to-r from-card via-background to-card">
      <div className="container-x flex flex-col items-center gap-6 py-6 md:flex-row md:gap-10">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Sparkles className="h-4 w-4" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
            Clinical-grade technology
          </p>
        </div>
        <div className="relative w-full overflow-hidden mask-fade-x">
          <div className="flex w-max animate-marquee items-center gap-14 hover:[animation-play-state:paused]">
            {[...partners, ...partners].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap font-display text-lg tracking-[-0.01em] text-foreground/40 transition-colors hover:text-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
