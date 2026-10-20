"use client";

import { formatPlanPrice, PLANS, type Plan, type PlanId } from "@/lib/plans";

type Props = {
  value: PlanId;
  onChange: (id: PlanId) => void;
};

export function PlanPicker({ value, onChange }: Props) {
  return (
    <div className="grid gap-3">
      {PLANS.map((plan) => {
        const selected = plan.id === value;
        return (
          <button
            key={plan.id}
            type="button"
            disabled={!plan.available}
            onClick={() => onChange(plan.id)}
            aria-pressed={selected}
            className={`relative rounded-2xl border-2 p-4 text-left transition ${
              selected
                ? "border-orange bg-orange/10"
                : plan.available
                  ? "border-brown/15 bg-white hover:border-orange/50"
                  : "cursor-not-allowed border-brown/10 bg-brown/5 opacity-70"
            }`}
          >
            <div className="flex items-center gap-3">
              <PlanIcon id={plan.id} />
              <span className="flex-1 font-heading text-xl font-semibold">{plan.name}</span>
              <span className="font-heading text-2xl font-bold text-orange">{formatPlanPrice(plan)}</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-brown/80">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-teal" aria-hidden>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Badge plan={plan} selected={selected} />
          </button>
        );
      })}
    </div>
  );
}

function Badge({ plan, selected }: { plan: Plan; selected: boolean }) {
  if (selected) {
    return (
      <span className="mt-3 inline-block rounded-full bg-orange px-2.5 py-0.5 text-xs font-medium text-cream">
        ✓ เลือกแล้ว
      </span>
    );
  }
  if (!plan.available) {
    return (
      <span className="mt-3 inline-block rounded-full bg-gold/25 px-2.5 py-0.5 text-xs text-brown/80">เร็วๆ นี้</span>
    );
  }
  return null;
}

// ไอคอนเส้นบางแต่ละแพ็กเกจ: ของขวัญ → กระเป๋า
function PlanIcon({ id }: { id: PlanId }) {
  const paths: Record<PlanId, React.ReactNode> = {
    free: (
      <>
        <rect x="3" y="9" width="18" height="12" rx="1.5" />
        <path d="M3 13h18M12 9v12" />
        <path d="M12 9c-1.5-3-5.5-4-5.5-1.5S10 9 12 9zM12 9c1.5-3 5.5-4 5.5-1.5S14 9 12 9z" />
      </>
    ),
    plus: (
      <>
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 13h16" />
      </>
    ),
  };

  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1E6B63"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[id]}
    </svg>
  );
}
