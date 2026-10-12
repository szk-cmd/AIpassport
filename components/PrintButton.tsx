"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="w-full rounded-full bg-orange py-4 font-heading text-lg font-semibold text-cream"
    >
      🖨 พิมพ์ / บันทึกเป็น PDF
    </button>
  );
}
