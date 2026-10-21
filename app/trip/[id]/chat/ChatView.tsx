"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { PRICE_PER_DAY } from "@/lib/config";
import { formatBaht, formatDate } from "@/lib/format";
import { imageForAi, makeThumb } from "@/lib/photo-prep";
import {
  addMessages,
  dayCount,
  newId,
  todayKey,
  updateMessage,
  updateTrip,
  useStore,
  type ChatMessage,
  type ChatPhoto,
  type StoredTrip,
} from "@/lib/trip-store";
import { TripDrawer } from "./TripDrawer";

const PLACEHOLDER_COLORS = ["#E8A93C", "#1E6B63", "#E0642C", "#5B7DA8", "#B5838D"];
const MAX_PHOTOS_PER_SEND = 10; // รูปย่อเก็บใน localStorage จึงจำกัดต่อครั้งไว้
const MAX_PHOTOS_TO_AI = 4; // ส่งให้ AI ดูแค่ 4 รูปแรกต่อครั้ง ประหยัดโควตา
const NETWORK_ERROR = "ส่งไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองใหม่อีกครั้งนะ";

type AiImage = { mimeType: "image/jpeg"; data: string };

// แชทระหว่างเที่ยว: ส่งข้อความ/รูป บอทตอบแบบ MOCK, ☰ เปิดลิ้นชักรายการทริป
export function ChatView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const data = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false); // กำลังย่อรูป
  const [waiting, setWaiting] = useState(false); // รอ AI ตอบ
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = data?.messages[id] ?? [];

  // ข้อความใหม่ → เลื่อนลงล่างสุด
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, waiting]);

  if (!data) return null;
  const trip = data.trips.find((t) => t.id === id);
  if (!trip) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <p className="text-xl">ไม่พบทริปนี้</p>
        <Link href="/" className="mt-4 inline-block text-cream/70 underline">
          กลับหน้าแรก
        </Link>
      </main>
    );
  }

  // ส่งข้อความให้ Agent 01 (ฝั่ง server ผ่าน /api/trip-chat) แล้วรอคำตอบ
  async function send(message: Pick<ChatMessage, "text" | "photos">, images: AiImage[] = []) {
    const t = trip!;
    const userMessage: ChatMessage = { id: newId(), from: "user", at: new Date().toISOString(), ...message };
    // ประวัติแชทแบบข้อความล้วน (รูปเก่าไม่ส่งซ้ำ ประหยัดโควตา)
    const history = messages.map((m) => ({
      role: m.from === "bot" ? "assistant" : "user",
      text: m.text ?? (m.photos ? `[ส่งรูป ${m.photos.length} รูป]` : ""),
    }));
    addMessages(id, [userMessage]);
    setWaiting(true);

    let reply = NETWORK_ERROR;
    try {
      const res = await fetch("/api/trip-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip: { title: t.title, startDate: t.start_date, endDate: t.end_date },
          today: todayKey(),
          history,
          message: { text: message.text ?? "", attachments: images },
        }),
      });
      if (res.ok) {
        const result = await res.json();
        reply = result.reply;
        if (result.extracted) updateMessage(id, userMessage.id, { extracted: result.extracted });
      }
    } catch {
      // เน็ตหลุด: ใช้ข้อความ NETWORK_ERROR
    }
    addMessages(id, [{ id: newId(), from: "bot", text: reply, at: new Date().toISOString() }]);
    setWaiting(false);
  }

  // ทริปไม่จบเอง ต้องให้ผู้ใช้กดจบเท่านั้น → เพิ่มรูปย้อนหลัง → สรุปค่าบริการ
  function handleEnd() {
    if (!window.confirm(`จบทริป “${trip!.title}” เลยไหม? หลังจบจะส่งข้อความเพิ่มไม่ได้แล้ว`)) return;
    updateTrip(id, { status: "ended", ended_at: new Date().toISOString() });
    router.push(`/trip/${id}/photos`);
  }

  // เลยวันจบที่ตั้งไว้: ขยาย end_date ถึงวันนี้ (วันที่เกินจะคิดเพิ่มรายวันตอนจบทริป)
  function handleExtend() {
    const today = todayKey();
    updateTrip(id, { end_date: today });
    addMessages(id, [
      {
        id: newId(),
        from: "bot",
        text: `ต่อทริปถึง ${formatDate(today)} แล้ว เที่ยวต่อให้สนุกนะ! วันที่เกินกำหนดคิดเพิ่มวันละ ${formatBaht(PRICE_PER_DAY)}`,
        at: new Date().toISOString(),
      },
    ]);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || waiting) return;
    send({ text: text.trim() });
    setText("");
  }

  async function handlePhotos(list: FileList | null) {
    const files = Array.from(list ?? []).slice(0, MAX_PHOTOS_PER_SEND);
    if (files.length === 0) return;
    setBusy(true);
    // รูปย่อเล็กเก็บในแชท + รูป 1024px ส่งให้ AI ดู (ทำพร้อมกัน)
    const [photos, images] = await Promise.all([
      Promise.all(
        files.map(
          async (f, i): Promise<ChatPhoto> => ({
            thumb: await makeThumb(f),
            color: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
            caption: f.name,
          }),
        ),
      ),
      Promise.all(files.slice(0, MAX_PHOTOS_TO_AI).map(imageForAi)),
    ]);
    setBusy(false);
    send({ photos }, images.filter((x) => x !== null));
  }

  return (
    <div className="fixed inset-x-0 top-0 flex flex-col bg-brown" style={{ bottom: "var(--nav-h, 0px)" }}>
      <ChatHeader trip={trip} onMenu={() => setDrawerOpen(true)} onEnd={handleEnd} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-md space-y-3">
          <MessageList trip={trip} messages={messages} />
          {waiting && <TypingBubble />}
          {trip.status === "active" && todayKey() > trip.end_date && (
            <ExtendPrompt trip={trip} onExtend={handleExtend} onEnd={handleEnd} />
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {trip.status === "active" ? (
        <form onSubmit={handleSend} className="border-t border-cream/10 bg-brown px-3 py-2">
          <div className="mx-auto flex max-w-md items-end gap-2">
            <label
              className={`flex size-11 shrink-0 items-center justify-center rounded-full text-xl ${
                busy || waiting ? "cursor-wait bg-cream/5" : "cursor-pointer bg-cream/10 hover:bg-cream/20"
              }`}
              aria-label="ส่งรูป"
            >
              {busy ? "⏳" : "📷"}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={busy || waiting}
                className="sr-only"
                onChange={(e) => {
                  handlePhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                // Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่ (บนคอม)
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) handleSend(e);
              }}
              placeholder="เล่าเรื่อง ค่าใช้จ่าย หรือที่ที่ไป..."
              className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl bg-cream px-4 py-2.5 text-brown outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim() || waiting}
              // ไม่ให้ช่องพิมพ์หลุดโฟกัสตอนกดส่ง คีย์บอร์ดจะได้ไม่ปิด และแถบเมนูไม่เด้งกลับมาดันปุ่ม
              onPointerDown={(e) => e.preventDefault()}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-orange text-cream disabled:opacity-40"
              aria-label="ส่ง"
            >
              ➤
            </button>
          </div>
        </form>
      ) : (
        <div className="border-t border-cream/10 px-4 py-4 text-center text-sm text-cream/70">
          ทริปนี้จบแล้ว แชทเป็นแบบอ่านอย่างเดียว
        </div>
      )}

      <TripDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} data={data} currentId={id} />
    </div>
  );
}

// แยกออกมาและ memo ไว้ พิมพ์ข้อความแล้วรายการแชท (ที่มีรูปเยอะ) จะไม่ต้องวาดใหม่ทุกตัวอักษร
const MessageList = memo(function MessageList({ trip, messages }: { trip: StoredTrip; messages: ChatMessage[] }) {
  return messages.map((m, i) => (
    <div key={m.id}>
      <DaySeparator trip={trip} message={m} previous={messages[i - 1]} />
      <Bubble message={m} />
      {m.extracted && <ExtractedNote extracted={m.extracted} />}
    </div>
  ));
});

function ChatHeader({ trip, onMenu, onEnd }: { trip: StoredTrip; onMenu: () => void; onEnd: () => void }) {
  const total = dayCount(trip.start_date, trip.end_date);
  const day = Math.min(Math.max(dayCount(trip.start_date, todayKey()), 1), total);

  return (
    <header className="border-b border-cream/10 bg-brown px-2 py-2">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <button
          type="button"
          onClick={onMenu}
          className="flex size-11 items-center justify-center rounded-full text-2xl hover:bg-cream/10"
          aria-label="รายการทริป"
        >
          ☰
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-lg font-semibold">{trip.title}</p>
          <p className="text-xs text-cream/60">
            {trip.status !== "active"
              ? "จบทริปแล้ว"
              : todayKey() > trip.end_date
                ? "เลยวันจบแล้ว · สรุปเมื่อกดจบทริป"
                : `กำลังเที่ยว · วันที่ ${day} จาก ${total}`}
          </p>
        </div>
        {trip.status === "active" && (
          <button
            type="button"
            onClick={onEnd}
            className="shrink-0 rounded-full border border-cream/30 px-4 py-2 text-sm font-medium hover:bg-cream/10"
          >
            จบทริป
          </button>
        )}
      </div>
    </header>
  );
}

// สิ่งที่ AI จดไว้จากข้อความนี้ ให้ผู้ใช้เห็นว่าระบบเก็บอะไรไปบ้าง
function ExtractedNote({ extracted }: { extracted: NonNullable<ChatMessage["extracted"]> }) {
  const items = [
    ...extracted.places.map((p) => `📍 ${p}`),
    ...extracted.expenses.map((e) => `💰 ${e.label} ${formatBaht(e.amount)}`),
  ];
  if (items.length === 0) return null;
  return <p className="mt-1 text-right text-[11px] text-cream/50">จดไว้: {items.join(" · ")}</p>;
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2" aria-live="polite">
      <div className="shrink-0 rounded-full bg-cream p-1">
        <LogoMark size={22} />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-cream px-4 py-3 text-brown/60">
        <span className="inline-flex gap-1" aria-label="กำลังพิมพ์">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-2 animate-bounce rounded-full bg-brown/40"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

// บอทถามเมื่อวันนี้เลยวันจบที่ตั้งไว้ (ไม่บันทึกเป็นข้อความ จะหายไปเองเมื่อตอบ)
function ExtendPrompt({ trip, onExtend, onEnd }: { trip: StoredTrip; onExtend: () => void; onEnd: () => void }) {
  const extra = dayCount(trip.end_date, todayKey()) - 1;
  return (
    <div className="flex items-end gap-2">
      <div className="shrink-0 rounded-full bg-cream p-1">
        <LogoMark size={22} />
      </div>
      <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-cream px-4 py-3 text-brown">
        <p className="leading-relaxed">
          ทริปนี้ตั้งวันจบไว้ {formatDate(trip.end_date)} ตอนนี้เลยมา {extra} วันแล้ว จะต่อทริปไหม?
        </p>
        <div className="mt-3 grid gap-2">
          <button type="button" onClick={onExtend} className="rounded-full bg-orange py-2 text-sm font-semibold text-cream">
            ต่อทริปถึงวันนี้ (+{formatBaht(extra * PRICE_PER_DAY)})
          </button>
          <button type="button" onClick={onEnd} className="rounded-full border border-brown/20 py-2 text-sm font-medium">
            จบทริปเลย
          </button>
        </div>
      </div>
    </div>
  );
}

// คั่นวันเมื่อข้อความข้ามวัน เช่น "วันที่ 2 · 15 พ.ย. 2569"
function DaySeparator({ trip, message, previous }: { trip: StoredTrip; message: ChatMessage; previous?: ChatMessage }) {
  const day = todayKey(new Date(message.at));
  if (previous && todayKey(new Date(previous.at)) === day) return null;
  const n = dayCount(trip.start_date, day);
  return (
    <p className="my-3 text-center text-xs text-cream/50">
      {n >= 1 ? `วันที่ ${n} · ` : ""}
      {formatDate(day)}
    </p>
  );
}

function Bubble({ message: m }: { message: ChatMessage }) {
  const mine = m.from === "user";
  const time = new Date(m.at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : ""}`}>
      {!mine && (
        <div className="shrink-0 rounded-full bg-cream p-1">
          <LogoMark size={22} />
        </div>
      )}
      {mine && <span className="text-[10px] text-cream/40">{time}</span>}
      <div
        className={`max-w-[78%] overflow-hidden rounded-2xl ${
          mine ? "rounded-br-sm bg-orange text-cream" : "rounded-bl-sm bg-cream text-brown"
        } ${m.photos ? "w-60 p-1" : "px-4 py-2.5"}`}
      >
        {m.photos && (
          <div className={`grid gap-1 ${m.photos.length > 1 ? "grid-cols-2" : ""}`}>
            {m.photos.map((p, i) =>
              p.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element -- รูปย่อในเครื่อง
                <img key={i} src={p.thumb} alt={p.caption} className="aspect-square w-full rounded-xl object-cover" />
              ) : (
                <div
                  key={i}
                  className="flex aspect-square w-full items-end rounded-xl p-2 text-left text-xs text-cream"
                  style={{ background: `linear-gradient(160deg, ${p.color}, ${p.color}aa 60%, #2B2019 140%)` }}
                  role="img"
                  aria-label={p.caption}
                >
                  {p.caption}
                </div>
              ),
            )}
          </div>
        )}
        {m.text && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}
      </div>
      {!mine && <span className="text-[10px] text-cream/40">{time}</span>}
    </div>
  );
}
