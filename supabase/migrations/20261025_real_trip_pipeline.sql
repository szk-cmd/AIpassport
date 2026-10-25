-- 2026-10-25: ย้ายทริป/แชทขึ้นฐานข้อมูล + pipeline สรุปทริปด้วย AI จริง
-- รันใน Supabase SQL Editor ครั้งเดียว (รันซ้ำได้ ไม่พัง)
-- หลังรันแล้ว กด "รีเซ็ตข้อมูลเดโม" ในหน้าโปรไฟล์ เพื่อ seed ทริปเดโม (is_demo = true)

begin;

-- ---------- trips ----------
-- owner: บัญชีที่เป็นเจ้าของ (ตอนนี้มีแค่บัญชีทดสอบ "test")
-- is_demo: ทริปเดโมที่ระบบ seed ไว้ → ใช้ข้อมูลชุดเดิม ไม่เรียก AI
--          ผู้ใช้ส่งข้อความ/อัปรูปจริงเพิ่มเมื่อไร ระบบตั้งเป็น false ทันที
-- slug: ลิงก์ /t/[slug] ได้หลังผู้ใช้ยืนยันใน review (Agent 05)
alter table trips add column if not exists owner text not null default 'test';
alter table trips add column if not exists is_demo boolean not null default false;
alter table trips add column if not exists slug text unique;
create index if not exists trips_owner_idx on trips(owner);

-- ---------- messages (แชทระหว่างทริป) ----------
-- photos: รูปที่ส่งในข้อความ [{ thumb, color, caption, url, takenAt, lat, lng }]
-- extracted: สถานที่/ค่าใช้จ่ายที่ Agent 01 ดึงจากข้อความนี้
-- is_seed: ข้อความตัวอย่างที่ระบบ seed (ไม่เอามาสรุปเมื่อผู้ใช้เพิ่มข้อมูลจริง)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  sender text not null check (sender in ('user', 'bot')),
  text text,
  photos jsonb not null default '[]'::jsonb,
  extracted jsonb,
  is_seed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_trip_idx on messages(trip_id, created_at);
alter table messages disable row level security; -- เดโม: เข้าถึงผ่าน API ฝั่ง server เท่านั้น

-- ---------- trip_items ----------
alter table trip_items add column if not exists is_seed boolean not null default false;

-- ---------- agent_runs ----------
-- 1 แถวต่อ (ทริป, agent) อัปเดตสถานะ pending → running → done / failed ให้หน้า progress poll
-- attempts: จำนวนครั้งที่ลอง, output: ผลของ agent ส่งต่อให้ agent ถัดไป
alter table agent_runs add column if not exists attempts integer not null default 0;
alter table agent_runs add column if not exists output jsonb;
create unique index if not exists agent_runs_trip_agent_idx on agent_runs(trip_id, agent);

commit;
