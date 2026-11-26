export type ConsoleDeliveryState = {
  habilitada: boolean;
  motivo: string | null;
};

export type ConsoleCounts = {
  itens: number;
  publicados: number;
  leads: number;
  leadsNaFila: number;
  leadsComFalha: number;
  limites: number;
};

export type ConsoleStatus = {
  banco: boolean;
  entrega: ConsoleDeliveryState;
  contagens: ConsoleCounts | null;
  verificadoEm: string;
};

export type ConsoleCatalogItem = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  minimum: number;
  personalizable: boolean;
  editorial_order: number;
  published: boolean;
  published_from: string | null;
  published_until: string | null;
  materials: string[];
  dimensions: string | null;
  weight_g: number | null;
  packaging: string | null;
  source_date: string;
  updated_at: string;
};

export type ConsoleBriefingStatus = "received" | "qualified" | "closed";

export type ConsoleBriefing = {
  id: string;
  protocol: string;
  contact_name: string;
  company: string;
  email: string;
  occasion: string;
  desired_date: string | null;
  budget: string | null;
  message: string | null;
  items: unknown;
  status: string;
  created_at: string;
  delivery_status: string;
  delivery_attempts: number;
  last_delivery_error: string | null;
  delivered_at: string | null;
};

export type ConsoleLimit = {
  client_hash: string;
  attempts: number;
  updated_at: string;
};

export type ConsoleScope = "situacao" | "catalogo" | "briefings" | "limites";

export type ConsolePayload =
  | { escopo: "situacao"; dados: ConsoleStatus }
  | { escopo: "catalogo"; dados: ConsoleCatalogItem[] }
  | { escopo: "briefings"; dados: ConsoleBriefing[] }
  | { escopo: "limites"; dados: ConsoleLimit[] };

export type ConsoleActionBody =
  | {
      acao: "catalogo-ficha";
      id: string;
      materials: string | string[];
      dimensions: string | null;
      weightG: string | number | null;
      packaging: string | null;
    }
  | {
      acao: "catalogo-publicacao";
      id: string;
      published: boolean;
      publishedFrom: string | null;
      publishedUntil: string | null;
      expectedUpdatedAt: string;
      confirmSku: string;
    }
  | { acao: "briefing-reenviar"; id: string }
  | { acao: "briefing-status"; id: string; status: ConsoleBriefingStatus }
  | { acao: "limites-limpar" };

export type ConsoleActionResult = { mensagem: string };