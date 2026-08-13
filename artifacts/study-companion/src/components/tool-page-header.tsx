import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function ToolPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:text-foreground"
          data-testid="link-back-dashboard"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Study Hub
        </Link>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
        <h1 className="font-script text-5xl leading-none text-foreground sm:text-6xl">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}