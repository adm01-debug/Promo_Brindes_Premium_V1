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

export type ConsoleReplication = {
  registrada: boolean;
  status: "success" | "failed" | null;
  ultimaTentativaEm: string | null;
  ultimoSucessoEm: string | null;
  horasDesdeSucesso: number | null;
  atrasada: boolean;
  erro: string | null;
  origem: number | null;
  curados: number | null;
};

export type ConsoleMaintenance = {
  registrada: boolean;
  status: "success" | "failed" | null;
  ultimaExecucaoEm: string | null;
  ultimoSucessoEm: string | null;
  minutosDesdeExecucao: number | null;
  atrasada: boolean;
  removidos: number | null;
  execucoes: number | null;
  erro: string | null;
};

export type ConsoleManualPrune = {
  registrada: boolean;
  falhou: boolean;
  ultimaExecucaoEm: string | null;
  removidos: number | null;
  erro: string | null;
};

export type ConsoleStatus = {
  banco: boolean;
  entrega: ConsoleDeliveryState;
  contagens: ConsoleCounts | null;
  replicacao: ConsoleReplication | null;
  manutencao: ConsoleMaintenance | null;
  manutencaoManual: ConsoleManualPrune | null;
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
  delivery_lease_expires_at: string | null;
  last_delivery_error: string | null;
  delivered_at: string | null;
};

export type ConsoleLimit = {
  client_hash: string;
  reference: string;
  attempts: number;
  recent_attempts: number;
  blocked: boolean;
  last_attempt_at: string | null;
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
      expectedUpdatedAt: string;
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
  | { acao: "limites-limpar" }
  | { acao: "limites-liberar"; clientHash: string };

export type ConsoleActionResult = { mensagem: string };