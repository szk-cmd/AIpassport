-- 2026-10-21: สถานะทริปแบบใหม่ + คิดเงินรายวัน
-- รันใน Supabase SQL Editor ครั้งเดียว (รันซ้ำได้ ไม่พัง)
--
-- สถานะใหม่ของ trips:
--   active    = กำลังเที่ยว แชทได้ไม่จำกัด (ทริปไม่จบเอง)
--   ended     = ผู้ใช้กดจบทริปแล้ว รอชำระเงิน
--   paid      = ชำระแล้ว AI กำลังสรุป / รอผู้ใช้ตรวจทาน
--   completed = ผู้ใช้ยืนยันแล้ว มีลิงก์ /t/[slug]

begin;

-- ---------- status ----------

alter table trips drop constraint if exists trips_status_check;

-- แปลงสถานะเดิมให้เป็นชุดใหม่
update trips set status = case status
  when 'draft' then 'active'
  when 'collecting' then 'active'
  when 'processing' then 'paid'
  when 'awaiting_review' then 'paid'
  when 'failed' then 'paid'
  when 'published' then 'completed'
  else status
end;

alter table trips alter column status set default 'active';
alter table trips add constraint trips_status_check
  check (status in ('active', 'ended', 'paid', 'completed'));

-- ---------- คิดเงินรายวัน ----------

-- จำนวนวันตอนสร้างทริป (ราคาแพ็กเกจ) end_date ขยายได้ถ้าต่อทริป แต่ planned_days ไม่เปลี่ยน
alter table trips add column if not exists planned_days integer check (planned_days > 0);
update trips set planned_days = (end_date - start_date) + 1
  where planned_days is null and start_date is not null and end_date is not null;

alter table trips add column if not exists ended_at timestamptz;
alter table trips add column if not exists paid_amount integer check (paid_amount >= 0); -- บาท
alter table trips add column if not exists paid_at timestamptz;

-- คอลัมน์ plan (Free/Plus) เลิกใช้แล้ว แต่ไม่ลบ เผื่อมีข้อมูลเก่า

commit;
