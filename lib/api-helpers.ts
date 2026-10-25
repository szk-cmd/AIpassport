// ตัวช่วยร่วมของ API route (ฝั่ง server)
import "server-only";
import { PipelineError } from "./agents/pipeline";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID.test(v);
}

export function bad(message = "ข้อมูลไม่ถูกต้อง", status = 400) {
  return Response.json({ error: message }, { status });
}

// error ดิบเก็บใน log ฝั่ง server ผู้ใช้เห็นแค่ข้อความภาษาคน
export function serverError(error: unknown) {
  if (error instanceof PipelineError) return bad(error.message, error.status);
  console.error("[api]", error);
  return bad("ระบบขัดข้อง ลองใหม่อีกครั้งนะ", 500);
}
