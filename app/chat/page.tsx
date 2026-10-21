import type { Metadata } from "next";
import { RequireLogin } from "@/components/RequireLogin";
import { ChatHome } from "./ChatHome";

export const metadata: Metadata = { title: "แชท – PassportAI" };

export default function ChatTabPage() {
  return (
    <RequireLogin>
      <ChatHome />
    </RequireLogin>
  );
}
