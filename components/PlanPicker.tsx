"use client";

import { PLANS, type Plan, type PlanId } from "@/lib/plans";

type Props = {
  value: PlanId;
  onChange: (id: PlanId) => void;
};

export function PlanPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PLANS.map((plan) => {
        const selected = plan.id === value;
        return (
          <button
            key={plan.id}
            type="button"
            disabled={!plan.available}
            onClick={() => onChange(plan.id)}
            aria-pressed={selected}
            className={`relative flex flex-col items-center rounded-2xl border-2 px-2 py-4 text-center transition ${
              selected
                ? "border-orange bg-orange/10"
                : plan.available
                  ? "border-brown/15 bg-white hover:border-orange/50"
                  : "cursor-not-allowed border-brown/10 bg-brown/5 opacity-55"
            }`}
          >
            <PlanIcon id={plan.id} />
            <span className="mt-2 font-heading text-lg font-semibold">{plan.name}</span>
            <span className="font-heading text-xl font-bold text-orange">
              {plan.price === 0 ? "฿0" : `฿${plan.price.toLocaleString("th-TH")}`}
            </span>
            <span className="text-[11px] text-brown/60">{plan.price === 0 ? "ไม่ต้องสมัคร" : "ต่อ 1 ทริป"}</span>
            <span className="mt-2 text-xs text-brown/80">
              {plan.maxPhotos} รูป · {plan.maxDocs} เอกสาร
            </span>
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
      <span className="mt-2 rounded-full bg-orange px-2.5 py-0.5 text-xs font-medium text-cream">✓ เลือกแล้ว</span>
    );
  }
  if (!plan.available) {
    return <span className="mt-2 rounded-full bg-gold/25 px-2.5 py-0.5 text-xs text-brown/80">เร็วๆ นี้</span>;
  }
  return null;
}

// ไอคอนเส้นบางแต่ละแพ็กเกจ: ของขวัญ → กระเป๋า → เครื่องบิน → ลูกโลก
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
    pro: (
      <path d="M12 2c.8 0 1.5.7 1.5 1.5V9l7.5 4.5v2l-7.5-2.3V18l2 1.5V21L12 20l-3.5 1v-1.5l2-1.5v-4.8L3 15.5v-2L10.5 9V3.5C10.5 2.7 11.2 2 12 2z" />
    ),
    max: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
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
