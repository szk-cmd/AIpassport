import type { PlanId } from "./plans";

// ---------- ตารางในฐานข้อมูล (ตรงกับ supabase/schema.sql) ----------

export type TripStatus =
  | "draft"
  | "collecting"
  | "processing"
  | "awaiting_review"
  | "published"
  | "failed";

export type Trip = {
  id: string;
  title: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;
  status: TripStatus;
  plan: PlanId;
  created_at: string;
};

export type ExpenseCategory =
  | "transport"
  | "lodging"
  | "food"
  | "activity"
  | "shopping"
  | "other";

export type PhotoData = {
  caption: string;
  place: string;
  color: string; // สีของรูป placeholder (ใช้ตอนยังไม่มีไฟล์จริง)
};

export type TicketData = {
  mode: "flight" | "train" | "bus";
  from: string;
  to: string;
  depart_at: string;
  price: number;
};

export type LodgingData = {
  name: string;
  check_in: string;
  check_out: string;
  price: number;
};

export type ExpenseData = {
  label: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
};

type TripItemBase = {
  id: string;
  trip_id: string;
  file_url: string | null;
  taken_at: string | null;
  lat: number | null;
  lng: number | null;
  selected: boolean;
  confidence: number | null; // 0-1 ความมั่นใจของ AI ที่อ่านข้อมูล
  created_at: string;
};

// type บอกว่า data ข้างในมีหน้าตาแบบไหน
export type TripItem = TripItemBase &
  (
    | { type: "photo"; data: PhotoData }
    | { type: "ticket"; data: TicketData }
    | { type: "lodging"; data: LodgingData }
    | { type: "expense"; data: ExpenseData }
  );

// ---------- trip_summary: ผลรวมจาก agent 04 ใช้ทำ 3 output ----------

export type DayStory = {
  date: string;
  title: string;
  story: string; // เรื่องเล่ายาว (Digital History)
  places: string[];
  photo_ids: string[];
};

export type RoutePoint = {
  name: string;
  lat: number;
  lng: number;
};

export type ExpenseLine = {
  label: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
};

export type TripStats = {
  days: number;
  places: number;
  distance_km: number;
  photos: number;
};

export type TripSummary = {
  trip_id: string;
  title: string;
  start_date: string;
  end_date: string;
  cover_photo_id: string;
  highlight_photo_ids: string[];
  days: DayStory[];
  route: RoutePoint[];
  expenses: {
    total: number;
    items: ExpenseLine[];
  };
  stats: TripStats;
  // /t/[slug]/print : กรอบรูปสำหรับผู้สูงอายุ ข้อความสั้น ตัวใหญ่
  print: {
    headline: string;
    short_text: string;
    photo_ids: string[];
  };
  // /t/[slug]/social : การ์ดสไตล์ Strava
  social: {
    headline: string;
    photo_id: string;
  };
  // ได้หลังผู้ใช้ยืนยัน (agent 05)
  share: { slug: string } | null;
};
