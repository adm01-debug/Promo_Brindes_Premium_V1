"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Plus } from "lucide-react";
import {
  products,
  readSelection,
  type Product,
  type Selection,
} from "@/lib/catalog";

const selectionKey = "promo-premium-selection-v1";

export default function ProductDetailActions({
  product,
}: {
  product: Product;
}) {
  const [selected, setSelected] = useState<Selection>({});
  const minimum = Math.max(1, product.minimum ?? 1);
  const included = Boolean(selected[product.id]);

  useEffect(() => {
    try {
      setSelected(readSelection(localStorage.getItem(selectionKey)));
    } catch {
      // Storage can be unavailable without preventing product discovery.
    }
  }, []);

  function add() {
    setSelected((current) => {
      const next = { ...current, [product.id]: current[product.id] ?? minimum };
      try {
        localStorage.setItem(selectionKey, JSON.stringify(next));
      } catch {
        // The user can still continue in the current page session.
      }
      return next;
    });
  }

  return (
    <div className="product-page-actions">
      <button className="button button-gold" onClick={add}>
        {included ? <Check size={17} /> : <Plus size={17} />}
        {included ? "Incluído na seleção" : "Incluir no meu projeto"}
      </button>
      <a className="text-button" href="/#curadoria">
        Ver toda a curadoria <ArrowRight size={16} />
      </a>
      <p className="fine-print">
        Sua seleção é mantida somente neste navegador. A proposta confirma
        disponibilidade, personalização, investimento e prazo.
      </p>
    </div>
  );
}
