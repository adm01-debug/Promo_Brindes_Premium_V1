"use client";
import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export default function ShareCatalog({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [state, setState] = useState<
    "idle" | "busy" | "copied" | "shared" | "manual"
  >("idle");
  const [url, setUrl] = useState("");
  async function share() {
    const link = new URL(`/catalogos/${slug}`, window.location.origin).href;
    setUrl(link);
    setState("busy");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | Promo Brindes Premium`,
          url: link,
        });
        setState("shared");
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          setState("idle");
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setState("copied");
    } catch {
      setState("manual");
    }
  }
  const message =
    state === "copied"
      ? "Link copiado"
      : state === "shared"
        ? "Compartilhado"
        : state === "manual"
          ? "Copie o link abaixo para compartilhar."
          : "";
  return (
    <div className="catalog-share">
      <button
        type="button"
        className="text-button"
        onClick={() => void share()}
        disabled={state === "busy"}
        aria-label={`Compartilhar ${title}`}
      >
        {state === "copied" || state === "shared" ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Share2 size={16} aria-hidden="true" />
        )}
        {state === "copied" || state === "shared" ? message : "Compartilhar"}
      </button>
      <span role="status" className="sr-only">
        {message && `${title}: ${message}`}
      </span>
      {state === "manual" && (
        <label className="share-manual">
          Link para copiar
          <input
            aria-label={`Link de ${title}`}
            readOnly
            value={url}
            onFocus={(event) => event.target.select()}
          />
        </label>
      )}
    </div>
  );
}
