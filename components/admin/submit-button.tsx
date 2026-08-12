"use client";

import { useFormStatus } from "react-dom";

export function AdminSubmitButton({
  label,
  pendingLabel = "Saving…",
  className = "btn-soft",
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
