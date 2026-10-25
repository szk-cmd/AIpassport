# PassportAI – หนังสือเดินทางแห่งความทรงจำ

เว็บแอป (Next.js) ที่ให้ AI เปลี่ยนแชท รูป และใบเสร็จระหว่างเที่ยว ให้เป็น "หนังสือเดินทางแห่งความทรงจำ"
รายละเอียด flow, agent และกฎการพัฒนาอยู่ใน [CLAUDE.md](CLAUDE.md)

## รันบนเครื่อง

```bash
npm install
cp .env.local.example .env.local   # แล้วใส่ค่าจริง
npm run dev                        # เปิด http://localhost:3000 (บัญชีทดสอบ test / 1234)
```

ฐานข้อมูล: รัน `supabase/schema.sql` ใน Supabase SQL Editor (โปรเจกต์เดิมให้รัน `supabase/migrations/` ตามลำดับชื่อไฟล์)
ไฟล์รูปเก็บใน Storage bucket `trip-files` (schema.sql สร้างให้แล้ว)

## Environment variables

ใส่ใน `.env.local` (บนเครื่อง) และใน Vercel → Project → Settings → Environment Variables

| ชื่อ | จำเป็น | ฝั่ง | ใช้ทำอะไร |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | browser + server | URL ของโปรเจกต์ Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | browser | anon key (อัปโหลดรูปตรงจากเบราว์เซอร์เข้า Storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | server เท่านั้น | service role key (ห้ามขึ้นต้น `NEXT_PUBLIC_`) |
| `AI_PROVIDER` | ✓ | server | `mock` / `gemini` / `anthropic` |
| `GEMINI_API_KEY` | ถ้าใช้ gemini | server เท่านั้น | key จาก Google AI Studio |
| `GEMINI_MODEL` | – | server | เว้นว่าง = `gemini-3.8-flash` |
| `GEMINI_FALLBACK_MODEL` | – | server | เว้นว่าง = `gemini-3.5-flash-lite` (ใช้เมื่อรุ่นหลักคนใช้เยอะ) |
| `ANTHROPIC_API_KEY` | ถ้าใช้ anthropic | server เท่านั้น | key จาก Anthropic Console |
| `ANTHROPIC_MODEL` | – | server | เว้นว่าง = `claude-opus-5-5` |

ไม่มี key ของ AI ตัวที่เลือก หรือ `AI_PROVIDER=mock` = ใช้ข้อมูลจำลอง (แอปยังใช้ได้)

## Deploy บน Vercel

1. Import repo นี้ใน Vercel (Framework: Next.js ค่าอื่นใช้ค่าเริ่มต้น)
2. ใส่ environment variables ตามตารางด้านบน
3. Deploy

ข้อควรรู้
- รูปอัปโหลดตรงจากเบราว์เซอร์เข้า Supabase Storage ไม่ผ่าน API ของเรา (Vercel รับ request ได้ไม่เกิน ~4.5MB)
  เบราว์เซอร์อ่าน EXIF ก่อน → แปลง HEIC เป็น JPEG → ย่อด้านยาวไม่เกิน 1600px → อัปโหลด แล้วส่งให้ API แค่ลิงก์
- route ที่เรียก AI ตั้ง `maxDuration = 60` วินาที (แพ็ก Hobby ตั้งได้สูงสุด 300) และแต่ละ agent เป็น request แยกกัน
- ทริป แชท และการ login ทดสอบเก็บใน localStorage ของเบราว์เซอร์ (โหมด MOCK) ยังไม่มี cookie
