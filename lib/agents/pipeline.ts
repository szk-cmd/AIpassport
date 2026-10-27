// ตัวคุมลำดับ agent สรุปทริป (ฝั่ง server) 1 request = 1 agent
// ลำดับ: 01 → (02 และ 03 ขนานกัน) → 04 → หยุดรอผู้ใช้ตรวจทาน → 05 (lib/agents/preserve.ts)
// สถานะแต่ละขั้นอยู่ใน agent_runs ให้หน้า progress poll ทุก 2 วิ
import "server-only";
import { AiError } from "../ai";
import { db, getTrip, saveOutput } from "../trips-server";
import { buildSummary } from "./builder";
import { runCollect } from "./collect";
import { runIntelligence } from "./intelligence";
import type { CollectOutput, IntelligenceOutput, StoryOutput } from "./shared";
import { runStory } from "./story";

export const PIPELINE = ["01", "02", "03", "04"] as const;
export type AgentId = (typeof PIPELINE)[number];

const DEPENDS_ON: Record<AgentId, AgentId[]> = { "01": [], "02": ["01"], "03": ["01"], "04": ["02", "03"] };
// ขั้นที่ "กำลังทำ" นานเกินนี้ถือว่าค้าง (ปิดหน้าไประหว่างทาง หรือ Vercel ตัดตอนครบ maxDuration 300 วิ) เริ่มใหม่ได้
const STALE_MS = 320_000;
// รอบแรกใช้เวลาเกินนี้แล้วพัง ไม่ลองซ้ำใน request เดิม (จะเกิน maxDuration) ให้ผู้ใช้กด "ลองใหม่" แทน
const RETRY_WITHIN_MS = 90_000;
const FALLBACK_ERROR = "ขั้นนี้ทำงานไม่สำเร็จ ลองใหม่อีกครั้งนะ";

export type RunStatus = "pending" | "running" | "done" | "failed";
export type RunState = { agent: AgentId; status: RunStatus; error: string | null; attempts: number };

type RunRow = {
  agent: AgentId;
  status: RunStatus;
  error: string | null;
  attempts: number;
  started_at: string | null;
  output: unknown;
};

async function getRunRows(tripId: string): Promise<Map<AgentId, RunRow>> {
  const { data, error } = await db()
    .from("agent_runs")
    .select("agent, status, error, attempts, started_at, output")
    .eq("trip_id", tripId);
  if (error) throw new Error(`[runs] ${error.message}`);
  return new Map(((data ?? []) as RunRow[]).map((r) => [r.agent, r]));
}

async function saveRun(tripId: string, agent: AgentId, fields: Partial<RunRow> & { ended_at?: string | null }) {
  const { error } = await db()
    .from("agent_runs")
    .upsert({ trip_id: tripId, agent, ...fields }, { onConflict: "trip_id,agent" });
  if (error) throw new Error(`[runs] ${error.message}`);
}

// สถานะทุกขั้นสำหรับหน้า progress (ไม่ส่ง output ใหญ่ๆ กลับไป)
export async function getRuns(tripId: string): Promise<RunState[]> {
  const rows = await getRunRows(tripId);
  return PIPELINE.map((agent) => {
    const r = rows.get(agent);
    return { agent, status: r?.status ?? "pending", error: r?.error ?? null, attempts: r?.attempts ?? 0 };
  });
}

// รัน agent หนึ่งขั้น ล้มเหลวลองใหม่ 1 ครั้ง ถ้ายังไม่ได้บันทึก failed พร้อมข้อความภาษาคน
// ห้ามใช้ข้อมูลเดโมแทนผลจริงเมื่อ AI ล้มเหลว
export async function runAgent(tripId: string, agent: AgentId): Promise<RunState> {
  const trip = await getTrip(tripId);
  if (!trip) throw new PipelineError(404, "ไม่พบทริปนี้");
  if (trip.status !== "paid") throw new PipelineError(409, "ทริปนี้ยังไม่ได้ชำระเงิน หรือสรุปเสร็จแล้ว");

  const rows = await getRunRows(tripId);
  const current = rows.get(agent);
  if (current?.status === "done") return toState(agent, current);
  if (current?.status === "running" && current.started_at && Date.now() - Date.parse(current.started_at) < STALE_MS) {
    return toState(agent, current); // อีกแท็บกำลังทำอยู่ รอ poll
  }
  const deps = DEPENDS_ON[agent].map((d) => rows.get(d));
  if (deps.some((d) => d?.status !== "done")) throw new PipelineError(409, "ต้องรอขั้นก่อนหน้าให้เสร็จก่อน");
  const outputOf = <T>(id: AgentId) => rows.get(id)?.output as T;

  let attempts = current?.attempts ?? 0;
  const begun = Date.now();
  for (let round = 1; round <= 2; round++) {
    attempts += 1;
    await saveRun(tripId, agent, {
      status: "running",
      attempts,
      error: null,
      started_at: new Date().toISOString(),
      ended_at: null,
    });
    try {
      const output = await perform(agent, trip, outputOf);
      await saveRun(tripId, agent, { status: "done", output, ended_at: new Date().toISOString() });
      return { agent, status: "done", error: null, attempts };
    } catch (error) {
      console.error(`[pipeline] ${tripId} agent ${agent} รอบที่ ${round}`, error);
      if (round === 2 || Date.now() - begun > RETRY_WITHIN_MS) {
        const message = error instanceof AiError ? error.userMessage : FALLBACK_ERROR;
        await saveRun(tripId, agent, { status: "failed", error: message, ended_at: new Date().toISOString() });
        return { agent, status: "failed", error: message, attempts };
      }
    }
  }
  throw new Error("unreachable");
}

async function perform(
  agent: AgentId,
  trip: NonNullable<Awaited<ReturnType<typeof getTrip>>>,
  outputOf: <T>(id: AgentId) => T,
): Promise<unknown> {
  switch (agent) {
    case "01":
      return runCollect(trip);
    case "02":
      // ทริปเดโมที่ผู้ใช้ยังไม่ได้เพิ่มอะไร: ใช้ข้อความตัวอย่างชุดเดิมตรงๆ ไม่เรียก AI
      return trip.is_demo ? demoStory(trip, outputOf<CollectOutput>("01")) : runStory(trip, outputOf<CollectOutput>("01"));
    case "03":
      return runIntelligence(outputOf<CollectOutput>("01"));
    case "04": {
      const summary = buildSummary(
        trip,
        outputOf<CollectOutput>("01"),
        outputOf<StoryOutput>("02"),
        outputOf<IntelligenceOutput>("03"),
      );
      await saveOutput(trip.id, summary);
      return { saved: true };
    }
  }
}

// เรื่องเล่าของทริปเดโม: ข้อความที่ seed ไว้ เรียงตามวัน (ไม่เรียก AI ไม่แต่งเพิ่ม)
function demoStory(trip: { title: string }, collected: CollectOutput): StoryOutput {
  return {
    days: collected.days.map((d, i) => ({ date: d.date, title: `วันที่ ${i + 1}`, story: d.texts.join(" ") })),
    headline: trip.title,
    short_text: collected.days.flatMap((d) => d.texts)[0]?.slice(0, 100) ?? "",
  };
}

function toState(agent: AgentId, r: RunRow): RunState {
  return { agent, status: r.status, error: r.error, attempts: r.attempts };
}

export class PipelineError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
