# PassportAI – หนังสือเดินทางแห่งความทรงจำ

## กฎการทำงาน
- ผู้ใช้เป็นมือใหม่: ทำทีละงานเล็ก อธิบายสั้นๆ เป็นภาษาไทยหลังทำเสร็จ
- ห้ามแก้ไฟล์ที่ไม่เกี่ยวกับงานที่สั่ง
- TypeScript, mobile-first, ข้อความ UI ภาษาไทย
- เรียก Anthropic API ฝั่ง server เท่านั้น ห้ามใส่ key ในโค้ด
- ทุก agent รองรับ MOCK=true (คืนข้อมูลปลอม ไม่เรียก API)
- ทำคนเดียว 3 สัปดาห์: เลือกวิธีที่ง่ายที่สุดที่ใช้งานได้
- ไม่ทำ: login, RLS, Supabase Realtime (ใช้ polling ทุก 2 วิ), LINE

## โทนดีไซน์
พื้นน้ำตาลเข้ม #2B2019, ครีม #F7F2EA, ส้ม #E0642C, เขียวอมฟ้า #1E6B63, เหลืองทอง #E8A93C
ฟอนต์ Prompt (หัวข้อ) + IBM Plex Sans Thai (เนื้อหา) จาก Google Fonts

## แพ็กเกจ (lib/plans.ts)
ทดลองฟรี ฿0 (30 รูป/10 เอกสาร), Plus ฿99 (100/30), Pro ฿499 (300/60), Max ฿999 (600/100) ต่อ 1 ทริป
ตอนนี้เลือกได้แค่ทดลองฟรี แพ็กเกจอื่นแสดง "เร็วๆ นี้" ยังไม่มีระบบจ่ายเงิน
ไฟล์ละไม่เกิน 10MB

## Flow ผู้ใช้
0. / : หน้าแรก โลโก้ + ปุ่ม "ลองใช้งานเลย ไม่ต้องสมัคร" → /plan, ปุ่มเข้าสู่ระบบ "เร็วๆ นี้"
0.5 /plan : การ์ดเลือกแพ็กเกจ → /new?plan=<id>
1. /new : แสดงแพ็กเกจที่เลือก (เปลี่ยนได้) + ชื่อทริป + วันเริ่ม-วันจบ + 2 ช่องอัปโหลด (รูปเที่ยว / ตั๋ว-ใบเสร็จ-ที่พัก) จำกัดจำนวนตามแพ็กเกจ
2. /trip/[id]/confirm : การ์ดรูปที่ AI คัด + ข้อมูลที่ดึงได้ แก้/เพิ่ม/ลบได้ confidence ต่ำไฮไลต์เหลือง
3. /trip/[id]/progress : ข้อความภาษาคน เช่น "กำลังเขียนเรื่องเล่า..." ไม่โชว์ชื่อ agent/error
4. /trip/[id]/review : แก้เรื่องเล่า/ค่าใช้จ่าย แล้วกดยืนยัน
5. Output 3 แบบ:
   - /t/[slug] Digital History: timeline รายวัน แผนที่ เรื่องเล่า รูปเด่น ค่าใช้จ่าย QR
   - /t/[slug]/print กรอบรูป A4 แนวตั้ง สำหรับผู้สูงอายุ ตัวใหญ่ ข้อความสั้น QR มุมล่าง
   - /t/[slug]/social การ์ด minimal สไตล์ Strava (1080x1920, 1080x1080, โปร่งใส) + โลโก้ + #PassportAI
6. /dev : ลิงก์ไปทุกหน้าด้วย mock data

## Agents (server, คืน JSON, ผ่าน orchestrator)
01 Travel Memory Collection: อ่าน EXIF (exifr) ตัดรูปนอกช่วงวัน, Claude vision อ่านตั๋ว/ใบเสร็จ, คัดรูปจากรูปย่อ
02 Travel Story Generation: เรื่องเล่ารายวัน + ข้อความสั้นสำหรับกรอบรูป
03 Travel Intelligence: ค่าใช้จ่าย + สถิติ (วัน, สถานที่, กม., จำนวนรูป)
04 Travel Passport Builder: รวมเป็น trip_summary ชุดเดียวสำหรับ 3 output
05 Memory Preservation: สร้าง slug + QR หลังผู้ใช้ยืนยัน
ลำดับ: 01 → (02 และ 03 ขนานกัน) → 04 → หยุด awaiting_review → ผู้ใช้ยืนยัน → 05
fail → retry 1 ครั้ง แล้วแจ้งผู้ใช้เป็นภาษาคน

## Database
- trips: id, title, start_date, end_date, status, plan
- trip_items: id, trip_id, type (photo/ticket/lodging/expense), data jsonb, file_url, taken_at, lat, lng, selected, confidence
- agent_runs: id, trip_id, agent, status, started_at, ended_at, error
- trip_outputs: trip_id, summary jsonb, updated_at
- shares: slug, trip_id

## ลำดับงาน
สัปดาห์ 1: โครงโปรเจกต์, DB, ทุกหน้าแบบ MOCK, /dev
สัปดาห์ 2: agents จริง + orchestrator + progress + review
สัปดาห์ 3: output 3 แบบ, deploy Vercel, ทดสอบมือถือ
