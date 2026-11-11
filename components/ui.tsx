import type { ReactNode, SVGProps } from "react";

import type { NextAction, Tier } from "@/lib/schema";

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cx(
        "rounded-xl border border-stone-200 bg-white shadow-sm shadow-stone-900/[0.03] dark:border-stone-800 dark:bg-stone-900 dark:shadow-none",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, aside, icon }: { title: string; aside?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-3.5 dark:border-stone-800">
      <h2 className="flex min-w-0 items-center gap-2 whitespace-nowrap [&>svg]:shrink-0 text-sm font-semibold text-stone-900 dark:text-stone-100">
        {icon}
        {title}
      </h2>
      {aside}
    </div>
  );
}

export const TIER_STYLES: Record<Tier, { label: string; pill: string; stroke: string }> = {
  hot: {
    label: "Hot",
    pill: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30",
    stroke: "stroke-rose-500",
  },
  warm: {
    label: "Warm",
    pill: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
    stroke: "stroke-amber-500",
  },
  cold: {
    label: "Cold",
    pill: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/30",
    stroke: "stroke-sky-500",
  },
  spam: {
    label: "Spam",
    pill: "bg-stone-100 text-stone-700 ring-stone-500/20 dark:bg-stone-500/10 dark:text-stone-300 dark:ring-stone-400/30",
    stroke: "stroke-stone-400",
  },
};

export function TierPill({ tier, size = "md" }: { tier: Tier; size?: "sm" | "md" }) {
  const style = TIER_STYLES[tier];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset",
        size === "md" ? "px-2.5 py-0.5 text-xs" : "px-2 py-px text-[11px]",
        style.pill,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {style.label}
    </span>
  );
}

export function ScoreRing({ score, tier }: { score: number; tier: Tier }) {
  const size = 112;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`Lead score ${score} out of 100`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-stone-100 dark:stroke-stone-800"
        />
        <circle
          key={score}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cx("ring-progress", TIER_STYLES[tier].stroke)}
          style={{ ["--ring-circumference" as string]: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
          {score}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">score</span>
      </div>
    </div>
  );
}

export const NEXT_ACTION_LABELS: Record<NextAction, string> = {
  call_within_1h: "Call within 1 hour",
  email: "Reply by email",
  nurture: "Add to nurture",
  discard: "Discard",
};

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const Icons = {
  inbox: (p: IconProps) => (
    <Icon {...p}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </Icon>
  ),
  sparkles: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
    </Icon>
  ),
  phone: (p: IconProps) => (
    <Icon {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </Icon>
  ),
  mail: (p: IconProps) => (
    <Icon {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </Icon>
  ),
  clock: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Icon>
  ),
  trash: (p: IconProps) => (
    <Icon {...p}>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </Icon>
  ),
  shield: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Icon>
  ),
  alert: (p: IconProps) => (
    <Icon {...p}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </Icon>
  ),
  check: (p: IconProps) => (
    <Icon {...p}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  ),
  copy: (p: IconProps) => (
    <Icon {...p}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Icon>
  ),
  refresh: (p: IconProps) => (
    <Icon {...p}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
      <path d="M21 3v5h-5" />
    </Icon>
  ),
  list: (p: IconProps) => (
    <Icon {...p}>
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
    </Icon>
  ),
  github: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  ),
};

export const NEXT_ACTION_ICONS: Record<NextAction, (p: IconProps) => ReactNode> = {
  call_within_1h: Icons.phone,
  email: Icons.mail,
  nurture: Icons.clock,
  discard: Icons.trash,
};
