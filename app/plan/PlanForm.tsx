"use client";

import Link from "next/link";
import { useState } from "react";
import { PlanPicker } from "@/components/PlanPicker";
import { DEFAULT_PLAN, type PlanId } from "@/lib/plans";

export function PlanForm() {
  const [planId, setPlanId] = useState<PlanId>(DEFAULT_PLAN.id);

  return (
    <div className="mt-6 rounded-2xl bg-cream p-5 text-brown">
      <PlanPicker value={planId} onChange={setPlanId} />
      <Link
        href={`/new?plan=${planId}`}
        className="mt-5 block w-full rounded-full bg-orange py-4 text-center font-heading text-lg font-semibold text-cream"
      >
        ถัดไป สร้างทริป
      </Link>
    </div>
  );
}
