import type { Metadata } from "next";
import { RequireLogin } from "@/components/RequireLogin";
import { CheckoutView } from "./CheckoutView";

export const metadata: Metadata = { title: "สรุปค่าบริการ – PassportAI" };

export default function CheckoutPage() {
  return (
    <RequireLogin>
      <CheckoutView />
    </RequireLogin>
  );
}
