-- PassportAI database schema
-- รันใน Supabase SQL Editor ได้หลายครั้ง (ไม่สร้างซ้ำถ้ามีอยู่แล้ว)
-- งานเดโม: ไม่ใช้ RLS บนตาราง (ห้ามใช้แบบนี้กับข้อมูลจริง)

-- ---------- ตาราง ----------

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date,
  end_date date, -- ขยายได้ถ้าผู้ใช้ต่อทริป
  -- active → ended → paid → completed (ดู migrations/20261021_trip_status_billing.sql)
  status text not null default 'active'
    constraint trips_status_check check (status in ('active', 'ended', 'paid', 'completed')),
  planned_days integer check (planned_days > 0), -- จำนวนวันตอนสร้าง ใช้คิดราคาแพ็กเกจ
  ended_at timestamptz,
  paid_amount integer check (paid_amount >= 0), -- บาท
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ฐานข้อมูลที่สร้างไว้ก่อนหน้า: รัน supabase/migrations/ ตามลำดับชื่อไฟล์

create table if not exists trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  type text not null check (type in ('photo', 'ticket', 'lodging', 'expense')),
  data jsonb not null default '{}'::jsonb,
  file_url text,
  taken_at timestamptz,
  lat double precision,
  lng double precision,
  selected boolean not null default true,
  confidence real check (confidence between 0 and 1),
  created_at timestamptz not null default now()
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  agent text not null,
  -- pending → running → done (หรือ failed)
  status text not null default 'pending',
  started_at timestamptz,
  ended_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists trip_outputs (
  trip_id uuid primary key references trips(id) on delete cascade,
  summary jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists shares (
  slug text primary key,
  trip_id uuid not null unique references trips(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists trip_items_trip_id_idx on trip_items(trip_id);
create index if not exists agent_runs_trip_id_idx on agent_runs(trip_id);

-- ---------- ปิด RLS (เดโมเท่านั้น) ----------

alter table trips disable row level security;
alter table trip_items disable row level security;
alter table agent_runs disable row level security;
alter table trip_outputs disable row level security;
alter table shares disable row level security;

-- ---------- Storage bucket ----------

insert into storage.buckets (id, name, public)
values ('trip-files', 'trip-files', true)
on conflict (id) do update set public = true;

-- storage.objects ปิด RLS เองไม่ได้ (Supabase เป็นเจ้าของตาราง)
-- จึงเปิด policy ให้มือถืออัปโหลด/อ่านไฟล์ใน bucket นี้ได้โดยไม่ต้อง login
drop policy if exists "trip-files public read" on storage.objects;
create policy "trip-files public read" on storage.objects
  for select using (bucket_id = 'trip-files');

drop policy if exists "trip-files public upload" on storage.objects;
create policy "trip-files public upload" on storage.objects
  for insert with check (bucket_id = 'trip-files');
