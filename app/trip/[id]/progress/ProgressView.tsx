"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ข้อความภาษาคน ไม่บอกชื่อ agent (เรียงตามลำดับงานใน CLAUDE.md)
const STEPS = [
  { agent: "01", text: "กำลังอ่านรูป ตั๋ว และใบเสร็จ แล้วคัดรูปที่สวยที่สุด..." },
  { agent: "02", text: "กำลังเขียนเรื่องเล่า..." },
  { agent: "03", text: "กำลังสรุปค่าใช้จ่ายและสถิติ..." },
  { agent: "04", text: "กำลังรวมเล่มหนังสือเดินทาง..." },
] as const;

type AgentId = (typeof STEPS)[number]["agent"];
type Run = { agent: AgentId; status: "pending" | "running" | "done" | "failed"; error: string | null };

// ลำดับ: 01 → (02 และ 03 พร้อมกัน) → 04
const DEPENDS_ON: Record<AgentId, AgentId[]> = { "01": [], "02": ["01"], "03": ["01"], "04": ["02", "03"] };
const POLL_MS = 2000;

export function ProgressView() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [runs, setRuns] = useState<Record<AgentId, Run> | null>(null);
  const [loadError, setLoadError] = useState(false);
  const requested = useRef(new Set<AgentId>()); // ขั้นที่หน้านี้สั่งรันไปแล้ว (กันสั่งซ้ำ)
  const reviewUrl = `/trip/${id}/review`;

  // อ่านสถานะจริงจาก agent_runs
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${id}/runs`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { trip: { title: string; status: string }; runs: Run[] };
      setTitle(data.trip.title);
      setRuns(Object.fromEntries(data.runs.map((r) => [r.agent, r])) as Record<AgentId, Run>);
      setLoadError(false);
      if (data.trip.status === "completed") router.replace(reviewUrl);
    } catch {
      setLoadError(true);
    }
  }, [id, reviewUrl, router]);

  // สั่งรัน agent หนึ่งขั้น (1 request = 1 agent) แล้วอ่านสถานะใหม่
  const start = useCallback(
    async (agent: AgentId) => {
      requested.current.add(agent);
      await fetch(`/api/trips/${id}/agents/${agent}`, { method: "POST" }).catch(() => null);
      await poll();
    },
    [id, poll],
  );

  useEffect(() => {
    const first = setTimeout(poll, 0);
    const timer = setInterval(poll, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [poll]);

  // ขั้นไหนพร้อม (ขั้นก่อนหน้าเสร็จแล้ว) และยังไม่เคยสั่ง → สั่งรันเลย ขั้นที่พังรอผู้ใช้กด "ลองใหม่"
  useEffect(() => {
    if (!runs) return;
    for (const { agent } of STEPS) {
      const run = runs[agent];
      const ready = DEPENDS_ON[agent].every((d) => runs[d].status === "done");
      // "running" ที่หน้านี้ไม่ได้สั่ง (เปิดหน้าใหม่ระหว่างทำ) ถาม server ครั้งเดียว: ยังทำอยู่ = รอ, ค้าง = เริ่มใหม่
      const waiting = run.status === "pending" || run.status === "running";
      if (ready && waiting && !requested.current.has(agent)) start(agent);
    }
  }, [runs, start]);

  const done = runs ? STEPS.every(({ agent }) => runs[agent].status === "done") : false;
  const failed = runs ? STEPS.filter(({ agent }) => runs[agent].status === "failed") : [];
  const finished = runs ? STEPS.filter(({ agent }) => runs[agent].status === "done").length : 0;
  const current = runs ? STEPS.find(({ agent }) => runs[agent].status !== "done") : STEPS[0];

  // เสร็จแล้วพาไปหน้าตรวจทานอัตโนมัติ
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => router.push(reviewUrl), 1500);
    return () => clearTimeout(timer);
  }, [done, router, reviewUrl]);

  const percent = Math.round((finished / STEPS.length) * 100);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <p className="font-heading text-sm tracking-widest text-gold">ขั้นที่ 2 จาก 3</p>
      <h1 className="mt-1 text-3xl font-semibold">{title}</h1>

      {/* ตราประทับหมุน */}
      <div className="my-10 flex justify-center">
        <div
          className={`flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed font-heading text-4xl ${
            done
              ? "border-teal bg-teal text-cream"
              : failed.length
                ? "border-orange text-orange"
                : "animate-spin border-gold text-gold [animation-duration:6s]"
          }`}
          aria-hidden
        >
          {done ? "✓" : failed.length ? "!" : "✈"}
        </div>
      </div>

      <p className="text-center font-heading text-xl" aria-live="polite">
        {done
          ? "เสร็จแล้ว! กำลังพาไปตรวจทาน..."
          : failed.length
            ? "มีบางขั้นยังไม่สำเร็จ"
            : loadError
              ? "กำลังเชื่อมต่อใหม่..."
              : current?.text}
      </p>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-cream/15">
        <div
          className="h-full rounded-full bg-orange transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-8 space-y-3">
        {STEPS.map(({ agent, text }, i) => {
          const run = runs?.[agent];
          const isDone = run?.status === "done";
          const isFailed = run?.status === "failed";
          const isActive = run?.status === "running";
          return (
            <li key={agent}>
              <div
                className={`flex items-center gap-3 ${
                  isDone ? "text-cream" : isFailed ? "text-orange" : isActive ? "text-gold" : "text-cream/35"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    isDone ? "bg-teal text-cream" : "border border-current"
                  }`}
                >
                  {isDone ? "✓" : isFailed ? "!" : i + 1}
                </span>
                {text.replace("กำลัง", "").replace("...", "")}
              </div>
              {/* ขั้นที่พัง: บอกเป็นภาษาคน + ลองใหม่เฉพาะขั้นนี้ */}
              {isFailed && (
                <div className="mt-2 ml-9 rounded-xl bg-cream/10 p-3 text-sm text-cream/85">
                  <p>{run.error}</p>
                  <button
                    type="button"
                    onClick={() => start(agent)}
                    className="mt-2 rounded-full bg-orange px-4 py-1.5 font-semibold text-cream"
                  >
                    ลองใหม่
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {done && (
        <Link
          href={reviewUrl}
          className="mt-10 block rounded-full bg-orange py-4 text-center font-heading text-lg font-semibold text-cream"
        >
          ไปตรวจทานเลย
        </Link>
      )}
    </main>
  );
}
