"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
export default function RetryCollection() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="button button-gold"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "Conferindo peças…" : "Tentar novamente"}
    </button>
  );
}
