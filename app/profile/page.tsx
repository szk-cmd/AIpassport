import type { Metadata } from "next";
import { RequireLogin } from "@/components/RequireLogin";
import { ProfileView } from "./ProfileView";

export const metadata: Metadata = { title: "โปรไฟล์ – PassportAI" };

export default function ProfilePage() {
  return (
    <RequireLogin>
      <ProfileView />
    </RequireLogin>
  );
}
