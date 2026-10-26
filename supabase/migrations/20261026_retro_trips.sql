-- 2026-10-26: สรุปทริปย้อนหลัง + บัญชีทดสอบแยกคน
-- รันใน Supabase SQL Editor ครั้งเดียว (รันซ้ำได้ ไม่พัง)

-- story_date: ทริปย้อนหลัง ผู้ใช้เลือกว่าข้อความนี้เล่าถึงวันไหนของทริป (null = ใช้วันที่ส่งข้อความ)
alter table messages add column if not exists story_date date;

-- บอกให้ Supabase API รู้จักคอลัมน์ใหม่ทันที
notify pgrst, 'reload schema';
