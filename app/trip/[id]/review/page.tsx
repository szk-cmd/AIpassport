import type { Metadata } from "next";
import { ReviewForm } from "./ReviewForm";

export const metadata: Metadata = { title: "ตรวจทาน – PassportAI" };

export default function ReviewPage() {
  return <ReviewForm />;
}
