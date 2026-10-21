import type { Metadata } from "next";
import { RequireLogin } from "@/components/RequireLogin";
import { StartForm } from "./StartForm";

export const metadata: Metadata = { title: "สร้างทริปใหม่ – PassportAI" };

export default function StartPage() {
  return (
    <RequireLogin>
      <StartForm />
    </RequireLogin>
  );
}
