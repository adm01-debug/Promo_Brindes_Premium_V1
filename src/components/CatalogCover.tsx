"use client";
import Image from "next/image";
import { useState } from "react";
import type { CatalogCollection } from "@/lib/catalog-library";

export default function CatalogCover({
  collection,
  image,
  priority = false,
}: {
  collection: Pick<CatalogCollection, "tone" | "coverTitle" | "number">;
  image?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`edition-cover edition-cover--${collection.tone}`}
      aria-hidden="true"
    >
      <span className="edition-brand">
        PROMO BRINDES <span>PREMIUM COLLECTION</span>
      </span>
      <span className="edition-rule" />
      <strong>{collection.coverTitle}</strong>
      <span className="edition-orbit" />
      <div className="edition-image">
        {image && !failed && (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 700px) 75vw, 330px"
            priority={priority}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <span className="edition-footer">
        <span>CATÁLOGO ONLINE</span>
        <span>Nº {collection.number}</span>
      </span>
    </div>
  );
}
