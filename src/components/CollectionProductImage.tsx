"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
export default function CollectionProductImage({
  image,
  name,
}: {
  image: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="collection-image-fallback">
      <ImageOff size={30} aria-hidden="true" />
      Imagem indisponível
    </span>
  ) : (
    <Image
      src={image}
      alt={name}
      fill
      sizes="(max-width: 700px) 90vw, (max-width: 1024px) 45vw, 30vw"
      onError={() => setFailed(true)}
    />
  );
}
