import { connection } from "next/server";
import { serverError } from "@/lib/api-helpers";
import { listData } from "@/lib/trips-server";

// GET /api/data : ทริป + แชททั้งหมดของบัญชีทดสอบ (ที่เก็บฝั่งเบราว์เซอร์โหลดจากตรงนี้)
export async function GET() {
  await connection();
  try {
    return Response.json(await listData());
  } catch (error) {
    return serverError(error);
  }
}
