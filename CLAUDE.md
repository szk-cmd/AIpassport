# PassportAI – หนังสือเดินทางแห่งความทรงจำ

## กฎการทำงาน
- ผู้ใช้เป็นมือใหม่: ทำทีละงานเล็ก อธิบายสั้นๆ เป็นภาษาไทยหลังทำเสร็จ
- ห้ามแก้ไฟล์ที่ไม่เกี่ยวกับงานที่สั่ง
- TypeScript, mobile-first, ข้อความ UI ภาษาไทย
- เรียก Anthropic API ฝั่ง server เท่านั้น ห้ามใส่ key ในโค้ด
- ทุก agent รองรับ MOCK=true (คืนข้อมูลปลอม ไม่เรียก API)
- ทำคนเดียว 3 สัปดาห์: เลือกวิธีที่ง่ายที่สุดที่ใช้งานได้
- ไม่ทำ: login, RLS, Supabase Realtime (ใช้ polling ทุก 2 วิ), LINE

## หมายเหตุการพัฒนา
- dev server ไม่รับการแก้ app/globals.css (Tailwind turbopack cache) → หยุด dev, ลบโฟลเดอร์ .next, รัน npm run dev ใหม่
  เลยใส่ style เฉพาะหน้าไว้ในคอมโพเนนต์ (Tailwind class / inline style) แทนการเพิ่มใน globals.css

## โทนดีไซน์
พื้นน้ำตาลเข้ม #2B2019, ครีม #F7F2EA, ส้ม #E0642C, เขียวอมฟ้า #1E6B63, เหลืองทอง #E8A93C
ฟอนต์ Prompt (หัวข้อ) + IBM Plex Sans Thai (เนื้อหา) จาก Google Fonts

## แพ็กเกจ (lib/plans.ts)
อัปโหลดรูปได้ไม่จำกัดทุกแพ็กเกจ จำกัดที่ output แทน
- Free ฿0: AI คัดเข้าพาสปอร์ต 20 รูป/ทริป, 2 ทริป/เดือน, Digital History + Social Card มีลายน้ำ
- Plus [฿__]: AI คัด 60 รูป/ทริป, ทริปไม่จำกัด, ไม่มีลายน้ำ, กรอบรูป PDF ความละเอียดสูง, สมุดสะสมตราประทับ
ตอนนี้เลือกได้แค่ Free, Plus แสดง "เร็วๆ นี้" ยังไม่มีระบบจ่ายเงิน (ยังไม่ได้บังคับจำนวนทริป/ลายน้ำจริง)
MAX_AI_PHOTOS_PER_TRIP = 100: เพดานรูปที่ส่งให้ AI ต่อทริป คุมต้นทุนหลังบ้าน
ไฟล์ละไม่เกิน 10MB (เช็กหลังย่อรูป, PDF เช็กขนาดเดิม)

## Flow ผู้ใช้
0. / : หน้าแรก โลโก้ + ปุ่ม "ลองใช้งานเลย ไม่ต้องสมัคร" → /trips, ปุ่มเข้าสู่ระบบ "เร็วๆ นี้"
0.3 /trips : ทริปของคุณ = กองการ์ดปัดแบบ Tinder (framer-motion) 1 ใบต่อ 1 ทริป แตะการ์ด → /t/[slug], ปุ่ม "+ สร้างทริปใหม่" → /plan
     ไม่มี login: เก็บ trip id ที่สร้างบนเครื่องนี้ใน localStorage
0.5 /plan : การ์ดเลือกแพ็กเกจ → /new?plan=<id>
1. /new : ผู้ใช้ไม่ต้องคัดรูปเอง (แนว Google Photos Trips / Polarsteps)
     แพ็กเกจที่เลือก (เปลี่ยนได้) + ชื่อทริป + ช่องอัปโหลดช่องเดียว "เลือกรูปจากทริปนี้ (เลือกเยอะได้เลย)"
     รับรูป + ตั๋ว/ใบเสร็จ/ที่พัก (รูปหรือ PDF) รวมกัน ไม่จำกัดจำนวน เลือกทั้งโฟลเดอร์จาก PC ได้
     ประมวลผลในเบราว์เซอร์ก่อนอัปโหลด (lib/photo-prep.ts): อ่าน EXIF (exifr) เอาวันที่ถ่าย + GPS,
     ย่อรูปด้านยาว 1200px JPEG 0.8, progress "กำลังอ่านรูป 120/212"
     จับกลุ่มทริปจากวันที่ (มีวันที่ไม่มีรูปคั่น = คนละทริป) → การ์ด "พบทริป 14 – 16 พ.ย. · 212 รูป" กด "ใช่ ทริปนี้"
     แล้ววันเริ่ม/วันจบเติมให้ (แก้เองได้) รูปที่ใช้ = รูปที่ถ่ายในช่วงวันนั้น
     รูปไม่มี EXIF (เช่นจาก LINE) อยู่กลุ่ม "ไม่ทราบวันที่" ผู้ใช้ติ๊กเองว่าจะรวมไหม, PDF ใช้ทั้งหมด
2. /trip/[id]/confirm : การ์ดรูปที่ AI คัด + ข้อมูลที่ดึงได้ แก้/เพิ่ม/ลบได้ confidence ต่ำไฮไลต์เหลือง
3. /trip/[id]/progress : ข้อความภาษาคน เช่น "กำลังเขียนเรื่องเล่า..." ไม่โชว์ชื่อ agent/error
4. /trip/[id]/review : แก้เรื่องเล่า/ค่าใช้จ่าย แล้วกดยืนยัน
5. Output 3 แบบ:
   - /t/[slug] Digital History: เลื่อนลงยาว เรียงเป็นการ์ด ปก → สรุปตัวเลข → รายวัน (ตราประทับ) → แผนที่ → ค่าใช้จ่าย → ตราประทับทุกที่ → แชร์ (QR/คัดลอกลิงก์/ไป social, print)
   - /t/[slug]/print กรอบรูป A4 แนวตั้ง สำหรับผู้สูงอายุ ตัวใหญ่ ข้อความสั้น QR มุมล่าง
   - /t/[slug]/social การ์ด minimal สไตล์ Strava (1080x1920, 1080x1080, โปร่งใส) + โลโก้ + #PassportAI
6. /dev : ลิงก์ไปทุกหน้าด้วย mock data

## Agents (server, คืน JSON, ผ่าน orchestrator)
01 Travel Memory Collection: รับรูปที่ย่อแล้ว + takenAt/lat/lng จากเบราว์เซอร์ (EXIF ถูกตัดตอนย่อ),
   แยกรูปเที่ยว vs ตั๋ว/ใบเสร็จ/ที่พัก, Claude vision อ่านเอกสาร, คัดรูปเด่นตามจำนวนของแพ็กเกจ (สัปดาห์ 2)
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
