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
    <section className="relative border-y border-border/70 bg-card/60">
      <div className="container-x flex flex-col items-center gap-6 py-7 md:flex-row md:gap-10">
        <p className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Clinical-grade technology
        </p>
        <div className="relative w-full overflow-hidden mask-fade-x">
          <div className="flex w-max animate-marquee items-center gap-12 hover:[animation-play-state:paused]">
            {[...partners, ...partners].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap font-display text-lg tracking-[-0.01em] text-foreground/35 transition-colors hover:text-foreground/70"
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
