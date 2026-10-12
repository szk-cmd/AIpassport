import type { Metadata } from "next";
import { NewTripForm } from "./NewTripForm";

export const metadata: Metadata = { title: "เริ่มทริปใหม่ – PassportAI" };

export default function NewTripPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <p className="font-heading text-sm tracking-widest text-gold">PASSPORT AI</p>
      <h1 className="mt-1 text-3xl font-semibold">เริ่มทริปใหม่</h1>
      <p className="mt-2 text-cream/70">
        กรอกชื่อทริปกับวันที่ แล้วเลือกรูป ตั๋ว และใบเสร็จทั้งหมดได้ในครั้งเดียว
      </p>
      <NewTripForm />
    </main>
  );
}
