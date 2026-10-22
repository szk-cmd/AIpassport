"use client";

import { useId } from "react";
import { cx } from "./utils";

type FieldProps = { label?: string; hint?: string; error?: string };

export const fieldClass = cx(
  "w-full rounded-control bg-surface px-4 text-body text-ink outline-none transition-shadow",
  "placeholder:text-ink-faint focus:bg-card focus:ring-2 focus:ring-brand",
  "disabled:text-ink-faint disabled:cursor-not-allowed",
);

// ป้ายชื่อ + ข้อความช่วย/ข้อผิดพลาดใต้ช่อง ใช้ร่วมกับ Input และ DateField
export function Field({
  id,
  label,
  hint,
  error,
  children,
}: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-label font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      {(error || hint) && (
        <p id={`${id}-note`} className={cx("text-caption", error ? "text-danger" : "text-ink-muted")}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} hint={hint} error={error}>
      <input
        id={inputId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error || hint ? `${inputId}-note` : undefined}
        className={cx(fieldClass, "h-12", error && "ring-2 ring-danger", className)}
        {...props}
      />
    </Field>
  );
}

// ช่องข้อความหลายบรรทัด (เรื่องเล่า ข้อความบนกรอบรูป)
export function TextArea({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field id={inputId} label={label} hint={hint} error={error}>
      <textarea
        id={inputId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error || hint ? `${inputId}-note` : undefined}
        className={cx(fieldClass, "min-h-24 resize-y py-3", error && "ring-2 ring-danger", className)}
        {...props}
      />
    </Field>
  );
}
