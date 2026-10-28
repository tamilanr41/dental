import type { ReactNode } from "react";

const safeHref = (value: string) => {
  const href = value.trim();
  if (/^https:\/\//i.test(href)) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  return "";
};

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-b${index}`}>{token.slice(2, -2)}</strong>);
    } else {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      const href = link ? safeHref(link[2]) : "";
      nodes.push(
        href ? (
          <a
            key={`${keyPrefix}-l${index}`}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="font-medium text-primary-800 underline decoration-primary-300 underline-offset-2 transition-colors hover:text-primary-950"
          >
            {link?.[1]}
          </a>
        ) : (
          link?.[1] ?? token
        ),
      );
    }
    lastIndex = match.index + token.length;
    index += 1;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function ArticleBody({ body }: { body: string }) {
  const blocks = body.trim().split(/\n{2,}/);
  return (
    <div className="space-y-5">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trimEnd());
        const key = `b${blockIndex}`;

        if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
          return (
            <ul key={key} className="ml-5 list-disc space-y-2 text-[16px] leading-[1.8] text-foreground/80">
              {lines.map((line, lineIndex) => (
                <li key={`${key}-${lineIndex}`}>{renderInline(line.trim().replace(/^[-*]\s+/, ""), `${key}-${lineIndex}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
          return (
            <ol key={key} className="ml-5 list-decimal space-y-2 text-[16px] leading-[1.8] text-foreground/80">
              {lines.map((line, lineIndex) => (
                <li key={`${key}-${lineIndex}`}>{renderInline(line.trim().replace(/^\d+\.\s+/, ""), `${key}-${lineIndex}`)}</li>
              ))}
            </ol>
          );
        }

        const single = lines.join(" ").trim();
        if (/^#{2,3}\s+/.test(single)) {
          const text = single.replace(/^#{2,3}\s+/, "");
          const isMinor = single.startsWith("###");
          return isMinor ? (
            <h3 key={key} className="pt-3 font-display text-[21px] font-medium tracking-tight text-foreground">
              {renderInline(text, key)}
            </h3>
          ) : (
            <h2 key={key} className="pt-4 font-display text-[26px] font-medium tracking-tight text-foreground">
              {renderInline(text, key)}
            </h2>
          );
        }
        if (single.startsWith(">")) {
          return (
            <blockquote key={key} className="border-l-2 border-primary-300 bg-primary-50/40 px-5 py-4 text-[16px] italic leading-relaxed text-foreground/75">
              {renderInline(single.replace(/^>\s?/, ""), key)}
            </blockquote>
          );
        }
        if (/^(-{3,}|\*{3,})$/.test(single)) {
          return <hr key={key} className="border-border/70" />;
        }
        return (
          <p key={key} className="text-[16.5px] leading-[1.85] text-foreground/80">
            {lines.map((line, lineIndex) => (
              <span key={`${key}-${lineIndex}`}>
                {renderInline(line, `${key}-${lineIndex}`)}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
