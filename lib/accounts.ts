// บัญชีทดสอบ (ยังไม่มีระบบสมาชิกจริง) แยกข้อมูลกันคนละบัญชี เพื่อนในทีมทดสอบพร้อมกันได้ไม่ชนกัน
// ใช้ได้ทั้งเบราว์เซอร์และ server: เบราว์เซอร์เก็บ session ใน localStorage + cookie ให้ server รู้ว่าเป็นบัญชีไหน
export const TEST_ACCOUNTS = ["test", "test2", "test3", "test4"] as const;
export const TEST_PASSWORD = "1234";
export const OWNER_COOKIE = "passportai_user";
export const DEFAULT_OWNER = "test";

export type Owner = (typeof TEST_ACCOUNTS)[number];

export function isTestAccount(value: unknown): value is Owner {
  return typeof value === "string" && (TEST_ACCOUNTS as readonly string[]).includes(value);
}

// ทริปเดโมของบัญชี test ใช้ id/slug ตายตัวเดิม (ลิงก์ในหน้า /dev ยังใช้ได้)
// บัญชีอื่นได้ id/slug ของตัวเอง เพราะฐานข้อมูลห้าม id และ slug ซ้ำ
export function demoIdFor(owner: string, id: string) {
  if (owner === DEFAULT_OWNER) return id;
  let h = 0x811c9dc5; // FNV-1a
  for (const c of owner) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0;
  return `${h.toString(16).padStart(8, "0")}${id.slice(8)}`;
}

export function demoSlugFor(owner: string, slug: string) {
  return owner === DEFAULT_OWNER ? slug : `${slug}-${owner}`;
}
