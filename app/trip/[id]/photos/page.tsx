import type { Metadata } from "next";
import { RequireLogin } from "@/components/RequireLogin";
import { PhotosStep } from "./PhotosStep";

export const metadata: Metadata = { title: "เพิ่มรูปย้อนหลัง – PassportAI" };

export default function PhotosPage() {
  return (
    <RequireLogin>
      <PhotosStep />
    </RequireLogin>
  );
}
