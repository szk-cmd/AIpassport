import { connection } from "next/server";
import { getRuns } from "@/lib/agents/pipeline";
import { bad, isUuid, serverError } from "@/lib/api-helpers";
import { getTrip } from "@/lib/trips-server";

// GET /api/trips/[id]/runs : สถานะ agent ทุกขั้น (หน้า progress poll ทุก 2 วิ)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!isUuid(id)) return bad();
  try {
    const trip = await getTrip(id);
    if (!trip) return bad("ไม่พบทริปนี้", 404);
    return Response.json({ trip: { title: trip.title, status: trip.status, slug: trip.slug }, runs: await getRuns(id) });
  } catch (error) {
    return serverError(error);
  }
}
