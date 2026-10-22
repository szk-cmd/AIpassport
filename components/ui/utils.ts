// ตัวช่วยร่วมของ components/ui

// รวม class โดยข้ามค่าว่าง/false
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ไอคอน lucide ทั้งแอปใช้ขนาด 20px เส้น 1.75 (ส่ง props นี้ให้ไอคอนทุกตัว)
export const ICON = { size: 20, strokeWidth: 1.75, "aria-hidden": true } as const;
