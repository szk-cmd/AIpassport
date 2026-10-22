"use client";

import { Calendar } from "lucide-react";
import { useId } from "react";
import { Field, fieldClass } from "./Input";
import { cx, ICON } from "./utils";

// ช่องเลือกวันที่ ใช้ตัวเลือกวันที่ของมือถือ/เบราว์เซอร์ (value เป็น "YYYY-MM-DD")
export function DateField({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: { label?: string; hint?: string; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} hint={hint} error={error}>
      <div className="relative">
        <Calendar {...ICON} className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-ink-muted" />
        <input
          id={inputId}
          type="date"
          aria-invalid={Boolean(error) || undefined}
          className={cx(
            fieldClass,
            "relative h-12 pr-3 pl-11",
            // ซ่อนไอคอนปฏิทินของเบราว์เซอร์ (มีของเราแล้ว) แต่ให้แตะตรงไหนของช่องก็เปิดตัวเลือกวันที่
            "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
            error && "ring-2 ring-danger",
            className,
          )}
          {...props}
        />
      </div>
    </Field>
  );
}
