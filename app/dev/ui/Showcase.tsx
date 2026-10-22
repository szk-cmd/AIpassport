"use client";

import {
  Camera,
  Compass,
  Home,
  Inbox,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  Plane,
  Plus,
  Receipt,
  Share2,
  User,
} from "lucide-react";
import { useState } from "react";
import {
  Avatar,
  BottomTabBar,
  Button,
  ButtonLink,
  Card,
  Chip,
  DateField,
  EmptyState,
  IconButton,
  ICON,
  Input,
  ListItem,
  Sheet,
  StatRow,
  StatTile,
  TopBar,
} from "@/components/ui";

const COLORS = [
  { name: "canvas", hex: "#FAFAF9", note: "พื้นหลัง" },
  { name: "surface", hex: "#F2F1EE", note: "พื้นรอง" },
  { name: "card", hex: "#FFFFFF", note: "การ์ด" },
  { name: "ink", hex: "#1C1917", note: "ตัวหนังสือหลัก" },
  { name: "ink-muted", hex: "#57534E", note: "ตัวหนังสือรอง" },
  { name: "ink-faint", hex: "#A8A29E", note: "ตัวหนังสือจาง" },
  { name: "line", hex: "#E7E5E4", note: "เส้นแบ่ง" },
  { name: "brand", hex: "#C2410C", note: "ปุ่มหลัก ลิงก์ active" },
  { name: "brown", hex: "#2B2019", note: "การ์ดปกทริป ตราประทับ" },
  { name: "success", hex: "#15803D", note: "สำเร็จ" },
  { name: "warning", hex: "#B45309", note: "เตือน" },
  { name: "danger", hex: "#B91C1C", note: "ผิดพลาด" },
];

const TYPE = [
  { cls: "text-title font-semibold", name: "title 28 / 600", sample: "ทริปของฉัน" },
  { cls: "text-heading font-semibold", name: "heading 20 / 600", sample: "เชียงใหม่ 3 วัน" },
  { cls: "text-body", name: "body 16 / 400", sample: "ลมหนาว ข้าวซอย และทะเลหมอกบนยอดดอย" },
  { cls: "text-label", name: "label 14 / 400", sample: "14 – 16 พ.ย. 2569" },
  { cls: "text-caption", name: "caption 12 / 400", sample: "บันทึกล่าสุด 2 ชั่วโมงที่แล้ว" },
];

const ICONS = [Home, MessageCircle, User, Plus, Camera, MapPin, Plane, Map, Receipt, Share2, Compass, Menu];

export function Showcase() {
  const [chips, setChips] = useState(["date", "qr"]);
  const [sheet, setSheet] = useState<"left" | "bottom" | null>(null);
  const [name, setName] = useState("");
  const toggle = (k: string) => setChips((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));

  return (
    <div className="min-h-dvh bg-canvas font-sans text-ink">
      <TopBar
        title="ระบบดีไซน์"
        subtitle="components/ui · ตัวอย่างทุกชิ้น"
        backHref="/dev"
        actions={
          <IconButton label="เปิดลิ้นชัก" onClick={() => setSheet("left")}>
            <Menu {...ICON} />
          </IconButton>
        }
      />

      <main className="mx-auto max-w-md space-y-12 px-4 pt-4 pb-12">
        <Section title="สี" note="ทุกสีเป็นทั้ง class (bg-canvas, text-ink) และ CSS variable (--color-canvas)">
          <div className="grid grid-cols-3 gap-2">
            {COLORS.map((c) => (
              <div key={c.name}>
                <div className="h-14 rounded-control shadow-soft" style={{ background: c.hex }} />
                <p className="mt-2 text-caption font-semibold">{c.name}</p>
                <p className="text-caption text-ink-muted">
                  {c.hex} · {c.note}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="ตัวอักษร" note="IBM Plex Sans Thai ทั้งแอป 5 ระดับ น้ำหนัก 400 และ 600">
          <Card className="space-y-4">
            {TYPE.map((t) => (
              <div key={t.name}>
                <p className="text-caption text-ink-faint">{t.name}</p>
                <p className={t.cls}>{t.sample}</p>
              </div>
            ))}
          </Card>
        </Section>

        <Section title="ระยะห่าง มุมโค้ง เงา" note="ระยะ 8 / 16 / 24 / 32 / 48 · มุม 8 ปุ่ม-ช่องกรอก, 16 การ์ด, กลม ชิป">
          <div className="space-y-2">
            {[8, 16, 24, 32, 48].map((px) => (
              <div key={px} className="flex items-center gap-4">
                <span className="w-10 text-caption text-ink-muted">{px}</span>
                <span className="h-4 rounded-full bg-brand/20" style={{ width: px * 3 }} />
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-4">
            <div className="flex size-20 items-center justify-center rounded-control bg-card text-caption shadow-soft">
              8
            </div>
            <div className="flex size-20 items-center justify-center rounded-card bg-card text-caption shadow-soft">
              16
            </div>
            <div className="flex h-20 items-center rounded-full bg-card px-6 text-caption shadow-soft">999</div>
          </div>
        </Section>

        <Section title="ไอคอน" note="lucide-react 20px เส้น 1.75 ไม่ใช้ emoji บนหน้าจอ">
          <div className="grid grid-cols-6 gap-2">
            {ICONS.map((Icon, i) => (
              <span key={i} className="flex h-12 items-center justify-center rounded-control bg-card shadow-soft">
                <Icon {...ICON} />
              </span>
            ))}
          </div>
        </Section>

        <Section title="Button">
          <div className="space-y-3">
            <Button block>ชำระเงิน ฿195</Button>
            <Button block variant="secondary" icon={Camera}>
              เพิ่มรูป
            </Button>
            <Button block variant="ghost">
              ข้ามไปก่อน
            </Button>
            <Button block disabled>
              สร้างหนังสือเดินทาง
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" icon={Plus}>
                ทริปใหม่
              </Button>
              <Button size="sm" variant="secondary">
                แก้ไข
              </Button>
              <Button size="sm" variant="ghost">
                ยกเลิก
              </Button>
              <ButtonLink size="sm" variant="secondary" href="/dev">
                ปุ่มลิงก์
              </ButtonLink>
            </div>
          </div>
        </Section>

        <Section title="Input · DateField">
          <Card className="space-y-6">
            <Input
              label="ชื่อทริป"
              placeholder="เช่น เชียงใหม่ 3 วัน"
              value={name}
              onChange={(e) => setName(e.target.value)}
              hint="ตั้งชื่อสั้นๆ จำง่าย"
            />
            <Input label="รหัสผ่าน" type="password" defaultValue="12" error="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" />
            <div className="grid grid-cols-2 gap-4">
              <DateField label="วันเริ่ม" defaultValue="2026-11-14" />
              <DateField label="วันจบ" defaultValue="2026-11-16" />
            </div>
            <Input label="ปิดใช้งาน" defaultValue="แก้ไม่ได้" disabled />
          </Card>
        </Section>

        <Section title="Card">
          <Card>
            <p className="text-heading font-semibold">แพ็กเกจ 3 วัน</p>
            <p className="mt-1 text-label text-ink-muted">ต่อทริปเกินกำหนด คิดเพิ่มวันละ ฿39</p>
            <p className="mt-4 text-title font-semibold">฿117</p>
          </Card>
          {/* การ์ดปกทริป: ที่เดียวที่ใช้น้ำตาลแบรนด์ */}
          <div className="mt-4 rounded-card bg-brown p-6 text-white shadow-soft">
            <p className="text-caption tracking-widest text-white/60">PASSPORT AI</p>
            <p className="mt-1 text-heading font-semibold">หัวหิน 3 วัน</p>
            <p className="text-label text-white/70">20 – 22 ต.ค. 2569</p>
          </div>
        </Section>

        <Section title="Chip">
          <div className="flex flex-wrap gap-2">
            <Chip icon={MapPin}>ดอยสุเทพ</Chip>
            <Chip icon={MapPin}>นิมมานเหมินท์</Chip>
            <Chip>กำลังเที่ยว</Chip>
          </div>
          <p className="mt-4 mb-2 text-caption text-ink-muted">ชิปแบบกดเลือกได้</p>
          <div className="flex flex-wrap gap-2">
            {[
              ["date", "วันที่"],
              ["text", "ข้อความสั้น"],
              ["map", "แผนที่เส้นทาง"],
              ["qr", "QR โค้ด"],
            ].map(([k, label]) => (
              <Chip key={k} selected={chips.includes(k)} onClick={() => toggle(k)}>
                {label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="StatTile">
          <StatRow>
            <StatTile value={3} label="ทริป" />
            <StatTile value={18} label="สถานที่" />
            <StatTile value={9} label="วันเที่ยว" />
          </StatRow>
        </Section>

        <Section title="ListItem">
          <Card padded={false} className="overflow-hidden">
            <ul className="divide-y divide-line">
              <li>
                <ListItem
                  href="/dev"
                  leading={<span className="size-12 rounded-control bg-[#5B7DA8]" />}
                  title="เชียงใหม่ 3 วัน"
                  subtitle="14 – 16 พ.ย. 2569"
                />
              </li>
              <li>
                <ListItem
                  onClick={() => undefined}
                  leading={<Avatar name="หัวหิน" />}
                  title="หัวหิน 3 วัน"
                  subtitle="ได้รูปแล้ว 1 รูป เก็บเข้าพาสปอร์ตให้แล้ว"
                  trailing="21 ต.ค."
                />
              </li>
              <li>
                <ListItem leading={<Receipt {...ICON} />} title="ค่าเข้าอุทยาน" trailing="฿40" />
              </li>
            </ul>
          </Card>
        </Section>

        <Section title="EmptyState">
          <Card padded={false}>
            <EmptyState
              icon={Inbox}
              title="ยังไม่มีทริปที่กำลังเที่ยว"
              description="สร้างทริปแล้วเล่าเรื่อง ส่งรูป หรือจดค่าใช้จ่ายระหว่างเที่ยวได้ที่นี่"
              action={
                <Button block icon={Plus}>
                  สร้างทริปใหม่
                </Button>
              }
            />
          </Card>
        </Section>

        <Section title="TopBar" note="แถบด้านบนสุดของหน้านี้ก็คือ TopBar">
          <Card padded={false} className="overflow-hidden">
            <TopBar
              title="หัวหิน 3 วัน"
              subtitle="กำลังเที่ยว · วันที่ 2 จาก 3"
              leading={
                <IconButton label="รายการทริป">
                  <Menu {...ICON} />
                </IconButton>
              }
              actions={
                <Button size="sm" variant="secondary">
                  จบทริป
                </Button>
              }
              className="static"
            />
          </Card>
        </Section>

        <Section title="BottomTabBar" note="ตัวอย่างวางในหน้า (ของจริงจะติดล่างจอ)">
          <Card padded={false} className="overflow-hidden">
            <BottomTabBar
              tabs={[
                { href: "/dev/ui", label: "หน้าแรก", icon: Home, active: true },
                { href: "/dev/ui", label: "แชท", icon: MessageCircle, dot: true },
                { href: "/dev/ui", label: "โปรไฟล์", icon: User },
              ]}
            />
          </Card>
        </Section>

        <Section title="Sheet">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSheet("left")}>
              ลิ้นชักซ้าย
            </Button>
            <Button variant="secondary" onClick={() => setSheet("bottom")}>
              ลิ้นชักล่าง
            </Button>
          </div>
        </Section>

        <Section title="Avatar">
          <div className="flex items-center gap-4">
            <Avatar name="test" size="sm" />
            <Avatar name="test" />
            <Avatar name="test" size="lg" />
          </div>
        </Section>
      </main>

      <Sheet open={sheet !== null} side={sheet ?? "left"} onClose={() => setSheet(null)} title="ทริปของฉัน">
        <Button block icon={Plus} className="mb-4">
          สร้างทริปใหม่
        </Button>
        <p className="mb-1 text-caption font-semibold text-ink-muted">กำลังเที่ยว</p>
        <ListItem title="หัวหิน 3 วัน" subtitle="20 – 22 ต.ค. 2569" onClick={() => setSheet(null)} className="-mx-4" />
        <ListItem title="เขาใหญ่ 2 วัน" subtitle="12 – 13 ต.ค. 2569" onClick={() => setSheet(null)} className="-mx-4" />
      </Sheet>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-sans text-heading font-semibold">{title}</h2>
      {note && <p className="mt-1 text-label text-ink-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
