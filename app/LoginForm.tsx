"use client";

import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { Button, ICON, Input } from "@/components/ui";
import { login } from "@/lib/trip-store";

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
    <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
      <Input
        placeholder="ชื่อผู้ใช้"
        autoComplete="username"
        autoCapitalize="none"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="ชื่อผู้ใช้"
      />
      <Input
        type="password"
        placeholder="รหัสผ่าน"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="รหัสผ่าน"
      />
      {/* พื้นเข้ม: แสดงข้อผิดพลาดบนแถบโปร่ง อ่านง่ายกว่าตัวแดงบนน้ำตาล */}
      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-control bg-white/10 px-4 py-3 text-label text-white">
          <CircleAlert {...ICON} size={16} className="shrink-0" />
          ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
        </p>
      )}
      <Button type="submit" block>
        เข้าสู่ระบบ
      </Button>
      <p className="text-center text-caption text-white/50">
        บัญชีทดสอบ: test, test2, test3, test4 · รหัสผ่าน 1234
        <br />
        แต่ละบัญชีมีข้อมูลแยกกัน
      </p>
    </form>
  );
}
