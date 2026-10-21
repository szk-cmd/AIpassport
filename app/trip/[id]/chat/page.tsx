import type { Metadata } from "next";
import { RequireLogin } from "@/components/RequireLogin";
import { ChatView } from "./ChatView";

export const metadata: Metadata = { title: "แชททริป – PassportAI" };

export default function ChatPage() {
  return (
    <RequireLogin>
      <ChatView />
    </RequireLogin>
  );
}
