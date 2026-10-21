"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { botReply } from "@/lib/chat-bot";
import { formatDate } from "@/lib/format";
import { makeThumb } from "@/lib/photo-prep";
import {
  addMessages,
  dayCount,
  newId,
  todayKey,
  useStore,
  type ChatMessage,
  type ChatPhoto,
  type StoredTrip,
} from "@/lib/trip-store";
import { TripDrawer } from "./TripDrawer";

const PLACEHOLDER_COLORS = ["#E8A93C", "#1E6B63", "#E0642C", "#5B7DA8", "#B5838D"];
const MAX_PHOTOS_PER_SEND = 10; // รูปย่อเก็บใน localStorage จึงจำกัดต่อครั้งไว้

// แชทระหว่างเที่ยว: ส่งข้อความ/รูป บอทตอบแบบ MOCK, ☰ เปิดลิ้นชักรายการทริป
export function ChatView() {
  const { id } = useParams<{ id: string }>();
  const data = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = data?.messages[id] ?? [];

  // ข้อความใหม่ → เลื่อนลงล่างสุด
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

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

  function send(message: Omit<ChatMessage, "id" | "from" | "at">) {
    const turn = messages.length;
    addMessages(id, [{ id: newId(), from: "user", at: new Date().toISOString(), ...message }]);
    // MOCK: หน่วงนิดหนึ่งให้เหมือนบอทกำลังพิมพ์
    setTimeout(() => {
      const reply = botReply({ text: message.text, photoCount: message.photos?.length }, turn);
      addMessages(id, [{ id: newId(), from: "bot", text: reply, at: new Date().toISOString() }]);
    }, 700);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    send({ text: text.trim() });
    setText("");
  }

  async function handlePhotos(list: FileList | null) {
    const files = Array.from(list ?? []).slice(0, MAX_PHOTOS_PER_SEND);
    if (files.length === 0) return;
    setBusy(true);
    const photos: ChatPhoto[] = await Promise.all(
      files.map(async (f, i) => ({
        thumb: await makeThumb(f),
        color: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
        caption: f.name,
      })),
    );
    setBusy(false);
    send({ photos });
  }

  return (
    <div className="fixed inset-x-0 top-0 flex flex-col bg-brown" style={{ bottom: "var(--nav-h, 0px)" }}>
      <ChatHeader trip={trip} onMenu={() => setDrawerOpen(true)} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-md space-y-3">
          {messages.map((m, i) => (
            <div key={m.id}>
              <DaySeparator trip={trip} message={m} previous={messages[i - 1]} />
              <Bubble message={m} />
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {trip.status === "active" ? (
        <form onSubmit={handleSend} className="border-t border-cream/10 bg-brown px-3 py-2">
          <div className="mx-auto flex max-w-md items-end gap-2">
            <label
              className={`flex size-11 shrink-0 items-center justify-center rounded-full text-xl ${
                busy ? "cursor-wait bg-cream/5" : "cursor-pointer bg-cream/10 hover:bg-cream/20"
              }`}
              aria-label="ส่งรูป"
            >
              {busy ? "⏳" : "📷"}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={busy}
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
              disabled={!text.trim()}
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

function ChatHeader({ trip, onMenu }: { trip: StoredTrip; onMenu: () => void }) {
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
            {trip.status === "active" ? `กำลังเที่ยว · วันที่ ${day} จาก ${total}` : "จบทริปแล้ว"}
          </p>
        </div>
      </div>
    </header>
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
        } ${m.photos ? "p-1" : "px-4 py-2.5"}`}
      >
        {m.photos && (
          <div className={`grid gap-1 ${m.photos.length > 1 ? "grid-cols-2" : ""}`}>
            {m.photos.map((p, i) =>
              p.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element -- รูปย่อในเครื่อง
                <img key={i} src={p.thumb} alt={p.caption} className="aspect-square w-full rounded-xl object-cover" />
              ) : (
                <div key={i} className="aspect-square w-full rounded-xl" style={{ background: p.color }} role="img" aria-label={p.caption} />
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
