"use client";

import { useState } from "react";
import { login } from "@/lib/trip-store";

const inputClass =
  "w-full rounded-full border border-cream/25 bg-cream/5 px-5 py-3.5 text-cream outline-none placeholder:text-cream/40 focus:border-orange";

// เข้าสู่ระบบด้วยบัญชีทดสอบ (ยังไม่มีระบบสมาชิกจริง) สำเร็จแล้วหน้าแรกจะเปลี่ยนเป็นประวัติทริปเอง
export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(!login(username, password));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 w-full space-y-3 text-left">
      <input
        className={inputClass}
        placeholder="ชื่อผู้ใช้"
        autoComplete="username"
        autoCapitalize="none"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="ชื่อผู้ใช้"
      />
      <input
        type="password"
        className={inputClass}
        placeholder="รหัสผ่าน"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="รหัสผ่าน"
      />
      {error && <p className="text-center text-sm text-orange">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</p>}
      <button
        type="submit"
        className="block w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream shadow-lg transition hover:brightness-110"
      >
        เข้าสู่ระบบ
      </button>
      <p className="text-center text-xs text-cream/50">บัญชีทดสอบ: test / 1234</p>
    </form>
  );
}
