"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

export default function ProductRecommendationImage({
  image,
}: {
  image: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="product-recommendation-fallback" aria-hidden="true">
      <ImageOff size={26} />
      Imagem indisponível
    </span>
  ) : (
    <Image
      src={image}
      alt=""
      fill
      sizes="(max-width: 700px) 88vw, (max-width: 1024px) 44vw, 29vw"
      onError={() => setFailed(true)}
    />
  );
}
