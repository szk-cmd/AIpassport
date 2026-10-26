// รีเซ็ตบัญชีทดสอบ: ล้างข้อมูลทั้งหมด (ฐานข้อมูล + ไฟล์ใน Storage) แล้ว seed ทริปเดโมใหม่
import "server-only";
import { PRICE_PER_DAY } from "./config";
import { DEMO_SLUG_IDS } from "./demo-ids";
import { MOCK_TRIPS } from "./mock";
import { mockActiveTrips } from "./mock-active";
import { demoIdFor, demoSlugFor } from "./accounts";
import { clearStorage, currentOwner, db } from "./trips-server";

function fail(error: { message: string } | null, what: string) {
  if (error) throw new Error(`[seed] ${what}: ${error.message}`);
}

// รีเซ็ตเฉพาะบัญชีที่ login อยู่ (cookie) ไม่แตะข้อมูลของบัญชีทดสอบอื่น
export async function resetAccount(mode: "demo" | "empty") {
  const owner = await currentOwner();
  const { data: own, error: le } = await db().from("trips").select("id").eq("owner", owner);
  fail(le, "list trips");
  const tripIds = (own ?? []).map((t: { id: string }) => t.id);
  // ลบทริปแล้ว messages / trip_items / agent_runs / trip_outputs / shares หายตาม (on delete cascade)
  const { error } = await db().from("trips").delete().eq("owner", owner);
  fail(error, "delete trips");
  await clearStorage(tripIds);
  if (mode === "demo") await seedDemo(owner);
}

// ทริปเดโม is_demo = true: จบแล้ว 3 ทริป (ผลสรุปชุดเดิมจาก lib/mock.ts) + กำลังเที่ยว 2 ทริป (แชทตัวอย่าง is_seed)
// บัญชี test ใช้ id/slug เดิม บัญชีอื่นได้ id/slug ของตัวเอง (lib/accounts.ts) ข้อมูลเหมือนกัน
async function seedDemo(owner: string, now = new Date()) {
  for (const { slug: baseSlug, summary: s } of MOCK_TRIPS) {
    const id = demoIdFor(owner, DEMO_SLUG_IDS[baseSlug]);
    const slug = demoSlugFor(owner, baseSlug);
    const { error } = await db()
      .from("trips")
      .insert({
        id,
        owner,
        is_demo: true,
        title: s.title,
        start_date: s.start_date,
        end_date: s.end_date,
        planned_days: s.stats.days,
        status: "completed",
        ended_at: `${s.end_date}T20:00:00+07:00`,
        paid_amount: s.stats.days * PRICE_PER_DAY,
        paid_at: `${s.end_date}T20:05:00+07:00`,
        created_at: `${s.start_date}T08:00:00+07:00`,
        slug,
      });
    fail(error, `trip ${slug}`);
    const { error: oe } = await db()
      .from("trip_outputs")
      .insert({ trip_id: id, summary: { ...s, trip_id: id, share: { slug } } });
    fail(oe, `output ${slug}`);
    const { error: se } = await db().from("shares").insert({ slug, trip_id: id });
    fail(se, `share ${slug}`);
  }

  for (const { trip: base, messages } of mockActiveTrips(now)) {
    const trip = { ...base, id: demoIdFor(owner, base.id) };
    const { error } = await db()
      .from("trips")
      .insert({ ...trip, owner, is_demo: true });
    fail(error, `trip ${trip.title}`);

    const { error: me } = await db()
      .from("messages")
      .insert(
        messages.map((m) => ({
          id: m.id,
          trip_id: trip.id,
          sender: m.from,
          text: m.text ?? null,
          photos: m.photos ?? [],
          extracted: m.extracted ?? null,
          is_seed: true,
          created_at: m.at,
        })),
      );
    fail(me, `messages ${trip.title}`);

    // รูปตัวอย่างในแชท (ไม่มีไฟล์จริง แสดงเป็นกล่องสี)
    const items = messages.flatMap((m) =>
      (m.photos ?? []).map((p) => ({
        trip_id: trip.id,
        type: "photo",
        file_url: null,
        taken_at: m.at,
        data: { caption: p.caption, color: p.color, thumb: null, source: "chat", message_id: m.id },
        is_seed: true,
      })),
    );
    if (items.length) {
      const { error: ie } = await db().from("trip_items").insert(items);
      fail(ie, `items ${trip.title}`);
    }
  }
}
