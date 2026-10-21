# PassportAI – หนังสือเดินทางแห่งความทรงจำ

## กฎการทำงาน
- ผู้ใช้เป็นมือใหม่: ทำทีละงานเล็ก อธิบายสั้นๆ เป็นภาษาไทยหลังทำเสร็จ
- ห้ามแก้ไฟล์ที่ไม่เกี่ยวกับงานที่สั่ง
- TypeScript, mobile-first, ข้อความ UI ภาษาไทย
- เรียก AI ฝั่ง server เท่านั้น ห้ามใส่ key ในโค้ด (key อยู่ใน .env.local)
- ทุก agent ต้องเรียก AI ผ่าน lib/ai.ts เท่านั้น ห้าม import SDK ของ AI ตรงๆ ที่อื่น
- AI_PROVIDER=mock หรือไม่มี key = ใช้ข้อมูลปลอม ไม่เรียก API
- ทำคนเดียว 3 สัปดาห์: เลือกวิธีที่ง่ายที่สุดที่ใช้งานได้
- ไม่ทำ: ระบบสมาชิกจริง/สมัครสมาชิก, ระบบจ่ายเงินจริง, RLS, Supabase Realtime (ใช้ polling ทุก 2 วิ), LINE
- login มีแค่บัญชีทดสอบ test / 1234 (lib/trip-store.ts) ระหว่าง MOCK ทริป แชท และ session เก็บใน localStorage

## หมายเหตุการพัฒนา
- dev server ไม่รับการแก้ app/globals.css (Tailwind turbopack cache) → หยุด dev, ลบโฟลเดอร์ .next, รัน npm run dev ใหม่
  เลยใส่ style เฉพาะหน้าไว้ในคอมโพเนนต์ (Tailwind class / inline style) แทนการเพิ่มใน globals.css

## โทนดีไซน์
พื้นน้ำตาลเข้ม #2B2019, ครีม #F7F2EA, ส้ม #E0642C, เขียวอมฟ้า #1E6B63, เหลืองทอง #E8A93C
ฟอนต์ Prompt (หัวข้อ) + IBM Plex Sans Thai (เนื้อหา) จาก Google Fonts

## การคิดเงิน (lib/config.ts)
PRICE_PER_DAY (ยังไม่ใช่ราคาจริง) คิดรายวัน ไม่มีแพ็กเกจ Free/Plus แล้ว
- สร้างทริป: เสนอราคาเป็นแพ็กเกจตามจำนวนวันที่ตั้งไว้ (planned_days × PRICE_PER_DAY) ยังไม่เก็บเงิน
- ทริปไม่จบเอง: รอผู้ใช้กด "จบทริป" เท่านั้น แชทค้างไว้ได้ไม่จำกัด
- วันนี้เลยวันจบที่ตั้งไว้: บอทถามว่าจะต่อทริปไหม ยืนยันแล้วขยาย end_date ถึงวันนี้ (planned_days ไม่เปลี่ยน)
- จบทริป: คิด max(planned_days, วันที่ใช้จริง) × PRICE_PER_DAY (จบก่อนกำหนดยังจ่ายเท่าแพ็กเกจ)
- ชำระเงินจำลอง: บัญชีทดสอบกด "ชำระเงิน" แล้วถือว่าสำเร็จ บันทึก paid_amount + paid_at
MAX_AI_PHOTOS_PER_TRIP = 100: เพดานรูปที่ส่งให้ AI ต่อทริป คุมต้นทุนหลังบ้าน
ไฟล์ละไม่เกิน 10MB (เช็กหลังย่อรูป, PDF เช็กขนาดเดิม)

## Flow ผู้ใช้
สถานะทริป: active (กำลังเที่ยว) → ended (กดจบ รอชำระ) → paid (ชำระแล้ว AI สรุป) → completed (ยืนยันแล้ว มี /t/[slug])
มีทริป active ได้ทีละ 1 ทริป
แถบเมนูล่างแบบ LINE (components/BottomNav.tsx): หน้าแรก / แชท / โปรไฟล์
  แสดงเฉพาะ /, /chat, /profile, /trip/[id]/chat, /t/[slug] (ซ่อนใน print/social/order, ขั้นตอนจบทริป และตอนพิมพ์ในแชท)
0. / : ยังไม่ login = โลโก้ + ฟอร์มเข้าสู่ระบบ (บัญชีทดสอบ) + ตัวอย่างพาสปอร์ต
     login แล้ว = ประวัติทริป: การ์ด "กำลังเที่ยว" ปักบนสุด → แชท, ตัวเลขสรุป (ทริป/สถานที่/วันเที่ยว),
     ชิปสถานที่ที่เคยไป, รายการทริปที่จบแล้ว → /t/[slug] (ยังไม่จ่าย → checkout, จ่ายแล้ว → progress)
     ปุ่ม "+ สร้างทริปใหม่" แสดงเฉพาะเมื่อไม่มีทริปที่กำลังเที่ยว
     ผู้ใช้ใหม่ไม่มีทริป: ภาพตราประทับ + ข้อความชวนเริ่มทริปแรก + ลิงก์ดูทริปตัวอย่าง
0.5 /start : ชื่อทริป + วันเริ่ม-วันจบ + ราคาแพ็กเกจประมาณการ → สร้างทริป active → แชท
1. /trip/[id]/chat : แชทระหว่างเที่ยว ส่งข้อความ/รูป (รูปย่อ 320px เก็บในเครื่อง) บอทตอบแบบ MOCK (lib/chat-bot.ts)
     ปุ่ม ☰ เปิดลิ้นชักรายการทริป, ปุ่ม "จบทริป", บอทถามต่อทริปเมื่อเลยวันจบ
     /chat : มีทริปที่กำลังเที่ยว → ไปแชทนั้น, ไม่มี → หน้าว่าง + ปุ่มสร้างทริป
     /profile : บัญชีทดสอบ, รีเซ็ตข้อมูลเดโม, ล้างทริปทั้งหมด, ออกจากระบบ
2. /trip/[id]/photos : หลังกดจบทริป เพิ่มรูปย้อนหลัง (components/PhotoDrop.tsx) ข้ามได้
     อ่าน EXIF (exifr) + ย่อรูป 1200px JPEG 0.8 ในเบราว์เซอร์ (lib/photo-prep.ts) เลือกทั้งโฟลเดอร์จาก PC ได้
3. /trip/[id]/checkout : สรุปค่าบริการ (แพ็กเกจ + วันที่ต่อ) + การ์ดปกเบลอ "พาสปอร์ตของคุณพร้อมแล้ว ชำระเงินเพื่อเปิดดู"
     (รูปแรกในแชท + ชื่อทริป ไม่ต้องรอ AI) ปุ่ม "ชำระเงิน" + ป้าย "บัญชีทดสอบ · ชำระเงินจำลอง"
4. /trip/[id]/progress : ข้อความภาษาคน เช่น "กำลังเขียนเรื่องเล่า..." ไม่โชว์ชื่อ agent/error
5. /trip/[id]/review : ผู้ใช้ตรวจสิ่งที่ AI สรุปจากแชท แก้เรื่องเล่า/ค่าใช้จ่าย แล้วกดยืนยัน → completed → "พาสปอร์ตพร้อมแล้ว"
     ปุ่มหลัก "ดูพาสปอร์ต" → /t/[slug], ปุ่มรอง "สั่งพิมพ์กรอบรูป" → /t/[slug]/order (ไม่บังคับ)
     (MOCK: ทุกทริปชี้ไปพาสปอร์ตตัวอย่างเชียงใหม่)
   /trip/[id]/confirm : หน้าตรวจข้อมูลแบบเดิม ยังไม่อยู่ใน flow ใหม่ (เปิดจาก /dev)
6. Output 3 แบบ:
   - /t/[slug] Digital History: เลื่อนลงยาว เรียงเป็นการ์ด ปก → สรุปตัวเลข → รายวัน (ตราประทับ) → แผนที่ → ค่าใช้จ่าย → ตราประทับทุกที่ → แชร์ (QR/คัดลอกลิงก์/ไป social, print)
   - /t/[slug]/print กรอบรูป A4 แนวตั้ง สำหรับผู้สูงอายุ ตัวใหญ่ ข้อความสั้น QR มุมล่าง
   - /t/[slug]/social การ์ด minimal สไตล์ Strava (1080x1920, 1080x1080, โปร่งใส) + โลโก้ + #PassportAI
   - /t/[slug]/order สั่งพิมพ์กรอบรูปจริง (ไม่ใช่แพ็กเกจ เสนอเฉพาะท้าย flow) 2 ขั้น:
     ขั้น 1 เลือก template (แถบตัวอย่างเลื่อนแนวนอน + ตัวอย่างใหญ่) แก้ข้อความสั้น (≤100 ตัว) สลับรูปเด่นจากรูปที่ AI คัด
     ขั้น 2 เลือกขนาด A4 / 8x10 นิ้ว + สีกรอบ ไม้ธรรมชาติ/ดำ/ขาว, ราคา [฿__], ปุ่ม "สั่งพิมพ์" ขึ้น "เปิดให้บริการเร็วๆ นี้"
     ปุ่ม "ดาวน์โหลด PDF ไปพิมพ์เอง" → /print?template=&hero=&text= (ตัวอย่างกับไฟล์พิมพ์ใช้ template เดียวกัน)
     เข้าจากหน้าพร้อมแล้ว และปุ่มในการ์ดแชร์ (ใบสุดท้าย) ของ /t/[slug]
   - template กรอบรูป components/print-templates/ (1 ไฟล์ต่อแบบ ลงทะเบียนใน index.ts) ทุกแบบตัวใหญ่ คอนทราสต์สูง QR เล็กมุมล่าง
     classic (ใหญ่ 1 + เล็ก 4), polaroid (4-6 รูปเอียง + คำบรรยาย), passport (หน้าข้อมูล + ตราประทับ + MRZ), minimal (รูปเดียว ตัวบาง)
7. /dev : ลิงก์ไปทุกหน้าด้วย mock data (+ /api/health เช็กฐานข้อมูล, /api/ai-test เช็ก AI)

## ข้อมูลเดโม (บัญชีทดสอบ)
เชียงใหม่ / ภูเก็ต / เกียวโต = completed + paid, หัวหิน 3 วัน = active อยู่วันที่ 2 เสมอ (lib/mock-active.ts คำนวณวันจากวันนี้)
เปลี่ยนข้อมูลเดโม → เพิ่มเลขเวอร์ชัน DATA_KEY ใน lib/trip-store.ts

## AI (lib/ai.ts)
AI_PROVIDER = mock | gemini | anthropic
- gemini: @google/genai, GEMINI_API_KEY, GEMINI_MODEL (ว่าง = gemini-3.8-flash รุ่น Flash ล่าสุดที่มี free tier)
- anthropic: @anthropic-ai/sdk, ANTHROPIC_API_KEY, ANTHROPIC_MODEL (ว่าง = claude-opus-5-5, เปิด fallbacks "default")
ฟังก์ชัน:
- chat(messages, attachments) แชทบอท Agent 01 หลายรอบ + แนบรูป คืนข้อความเสมอ (error → ข้อความภาษาคน)
- extract({ text, attachments }) → { places, expenses[{label, amount, category}] } สำหรับบันทึกลง trip_items
- generateText(prompt, { system }) สำหรับ Agent 02-04
รูปที่ส่งให้ AI ย่อในเบราว์เซอร์ก่อน ด้านยาว ≤ 1024px (imageForAi ใน lib/photo-prep.ts, AI_IMAGE_MAX_SIDE)
429/503 → รอแล้วลองใหม่ 1 ครั้ง (retry ของ SDK) ยังไม่ได้ → "ตอนนี้มีคนใช้เยอะ ลองใหม่อีกสักครู่นะ" ไม่โชว์ error ดิบ
extract/generateText โยน AiError (มี userMessage ภาษาคน) ให้ orchestrator ตัดสินใจ retry
เช็กการเชื่อมต่อ: GET /api/ai-test (ส่ง "สวัสดี" แล้วแสดงคำตอบ + provider + model)
ตอนนี้แชทในหน้าเว็บยังใช้บอท MOCK ฝั่งเบราว์เซอร์ (lib/chat-bot.ts) ยังไม่ได้ต่อ chat() จริง

## Agents (server, คืน JSON, ผ่าน orchestrator)
01 Travel Memory Collection: รับรูปที่ย่อแล้ว + takenAt/lat/lng จากเบราว์เซอร์ (EXIF ถูกตัดตอนย่อ),
   + ข้อความ/รูปจากแชท, แยกรูปเที่ยว vs ตั๋ว/ใบเสร็จ/ที่พัก, Claude vision อ่านเอกสาร, คัดรูปเด่น (สัปดาห์ 2)
02 Travel Story Generation: เรื่องเล่ารายวัน + ข้อความสั้นสำหรับกรอบรูป
03 Travel Intelligence: ค่าใช้จ่าย + สถิติ (วัน, สถานที่, กม., จำนวนรูป)
04 Travel Passport Builder: รวมเป็น trip_summary ชุดเดียวสำหรับ 3 output
05 Memory Preservation: สร้าง slug + QR หลังผู้ใช้ยืนยัน
เริ่มหลังชำระเงิน (status paid): 01 → (02 และ 03 ขนานกัน) → 04 → รอผู้ใช้ตรวจทาน → ผู้ใช้ยืนยัน → 05 (completed)
fail → retry 1 ครั้ง แล้วแจ้งผู้ใช้เป็นภาษาคน

## Database
- trips: id, title, start_date, end_date, status (active/ended/paid/completed), planned_days, ended_at, paid_amount, paid_at
  (คอลัมน์ plan เลิกใช้แล้ว) ฐานข้อมูลเดิม: รัน supabase/migrations/ ตามลำดับชื่อไฟล์
- trip_items: id, trip_id, type (photo/ticket/lodging/expense), data jsonb, file_url, taken_at, lat, lng, selected, confidence
- agent_runs: id, trip_id, agent, status, started_at, ended_at, error
- trip_outputs: trip_id, summary jsonb, updated_at
- shares: slug, trip_id

## ลำดับงาน
สัปดาห์ 1: โครงโปรเจกต์, DB, ทุกหน้าแบบ MOCK, /dev
สัปดาห์ 2: agents จริง + orchestrator + progress + review
สัปดาห์ 3: output 3 แบบ, deploy Vercel, ทดสอบมือถือ
