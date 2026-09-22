"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  Gift,
  Heart,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Modal from "./Modal";
import CatalogFilters, {
  countDiscoveryFilters,
  type CatalogDiscovery,
} from "./CatalogFilters";
import {
  briefingContextLabels,
  parseBriefingInput,
  type BriefingPayload,
} from "@/lib/briefing";
import {
  CATALOG_CONTRACT_VERSION,
  categories,
  downloadText,
  readUnverifiedSelection,
  serializeSelection,
  type CatalogPage,
  type Product,
  type Selection,
} from "@/lib/catalog";
import { catalogCollections } from "@/lib/catalog-library";

const faq = [
  [
    "Como funciona um projeto personalizado?",
    "Comece com uma seleção de peças e prepare um briefing com ocasião, quantidade e data desejada. A etapa comercial deve confirmar disponibilidade, possibilidades de gravação, valores e entrega antes da aprovação.",
  ],
  [
    "Existe uma quantidade mínima?",
    "A quantidade mínima varia conforme o produto, a técnica de personalização e a composição do kit. A seleção mostra o mínimo cadastrado de cada peça; condições de produção devem ser confirmadas na proposta.",
  ],
  [
    "Posso criar um kit com diferentes produtos?",
    "Sim. Você pode reunir diferentes peças na sua seleção e descrever a embalagem desejada no briefing. Compatibilidade, montagem e disponibilidade precisam ser avaliadas para cada projeto.",
  ],
  [
    "Como são definidos preço e prazo?",
    "O orçamento considera produto, quantidade, gravação, embalagem e destino. A data informada no briefing representa sua necessidade, sujeita à confirmação comercial.",
  ],
];

type BriefingDraft = {
  name: string;
  company: string;
  email: string;
  date: string;
  budget: string;
  budgetScope: "per-gift" | "total";
  eventDate: string;
  deadlineFlexibility: string;
  contactChannel: string;
  phone: string;
  logoStatus: string;
  message: string;
};
type VerifiedSelection = { products: Product[]; quantities: Selection };
type DiscoveryHistoryMode = "push" | "replace";
const validProtocol = (value: unknown): value is string =>
  typeof value === "string" && /^PB-[A-Z0-9]{12}$/.test(value);

const emptyBriefingDraft: BriefingDraft = {
  name: "",
  company: "",
  email: "",
  date: "",
  budget: "",
  budgetScope: "per-gift",
  eventDate: "",
  deadlineFlexibility: "",
  contactChannel: "",
  phone: "",
  logoStatus: "",
  message: "",
};

export default function Storefront({
  initialCatalog,
}: {
  initialCatalog: CatalogPage | null;
}) {
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Todos");
  const [search, setSearch] = useState("");
  const [occasions, setOccasions] = useState<string[]>([]);
  const [personalizable, setPersonalizable] = useState(false);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [sort, setSort] = useState<"curadoria" | "nome">("curadoria");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selected, setSelected] = useState<Selection>({});
  const selectedRef = useRef(selected);
  useLayoutEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const [selectionIssue, setSelectionIssue] = useState("");
  const [ready, setReady] = useState(false);
  const [detail, setDetail] = useState<Product | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState("Relacionamento com clientes");
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [deliveryConfigured, setDeliveryConfigured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [deliveryPending, setDeliveryPending] = useState(false);
  const [briefingDraft, setBriefingDraft] =
    useState<BriefingDraft>(emptyBriefingDraft);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogPage | null>(initialCatalog);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(!initialCatalog);
  const catalogRequestId = useRef(0);
  const catalogRequestController = useRef<AbortController | null>(null);
  const [networkOnline, setNetworkOnline] = useState(true);
  const [unavailableImages, setUnavailableImages] = useState<Set<string>>(
    () => new Set(),
  );
  const [knownProducts, setKnownProducts] = useState<Record<string, Product>>(
    () =>
      Object.fromEntries(
        (initialCatalog?.items ?? []).map((product) => [product.id, product]),
      ),
  );

  useEffect(() => {
    try {
      setSelected(
        readUnverifiedSelection(
          localStorage.getItem("promo-premium-selection-v1"),
        ),
      );
      const parsed: unknown = JSON.parse(
        localStorage.getItem("promo-premium-favorites-v1") ?? "[]",
      );
      if (Array.isArray(parsed))
        setFavorites(
          parsed.filter(
            (id): id is string =>
              typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id),
          ),
        );
    } catch {
      /* Storage is optional; the experience also works in memory. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    let active = true;
    fetch("/api/briefings", { headers: { Accept: "application/json" } })
      .then((response) =>
        response.ok ? response.json() : { configured: false },
      )
      .then((data: { configured?: unknown }) => {
        if (active) setDeliveryConfigured(data.configured === true);
      })
      .catch(() => {
        if (active) setDeliveryConfigured(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        "promo-premium-selection-v1",
        serializeSelection(selected),
      );
      localStorage.setItem(
        "promo-premium-favorites-v1",
        JSON.stringify(favorites),
      );
    } catch {
      /* Browsers can disable storage. */
    }
  }, [selected, favorites, ready]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const syncNetworkState = () => setNetworkOnline(navigator.onLine);
    syncNetworkState();
    window.addEventListener("online", syncNetworkState);
    window.addEventListener("offline", syncNetworkState);
    return () => {
      window.removeEventListener("online", syncNetworkState);
      window.removeEventListener("offline", syncNetworkState);
    };
  }, []);

  useEffect(() => {
    setIdempotencyKey(null);
  }, [selected]);

  useEffect(() => {
    const readDiscoveryUrl = (force = false) => {
      const url = new URL(window.location.href);
      const rawCategory = url.searchParams.get("categoria") || "Todos";
      const requestedCategory = categories.includes(
        rawCategory as (typeof categories)[number],
      )
        ? (rawCategory as (typeof categories)[number])
        : "Todos";
      const requestedSearch = url.searchParams.get("q")?.slice(0, 100) || "";
      const requestedPage = Number(url.searchParams.get("page") || "1");
      const requestedSort =
        url.searchParams.get("sort") === "nome" ? "nome" : "curadoria";
      const knownOccasions = new Set(
        catalogCollections.map((collection) => collection.slug),
      );
      const requestedOccasions = [
        ...new Set(
          (url.searchParams.get("ocasiao") || "")
            .split(",")
            .filter((occasion) => knownOccasions.has(occasion)),
        ),
      ];
      const requestedPersonalizable =
        url.searchParams.get("personalizavel") === "1";
      const rawQuantity = url.searchParams.get("quantidade") || "";
      const parsedQuantity = /^\d+$/.test(rawQuantity)
        ? Number(rawQuantity)
        : null;
      const requestedQuantity =
        parsedQuantity && parsedQuantity <= 10000 ? parsedQuantity : null;
      const hasQuery =
        requestedSearch ||
        requestedCategory !== "Todos" ||
        requestedOccasions.length > 0 ||
        requestedPersonalizable ||
        requestedQuantity !== null ||
        (Number.isInteger(requestedPage) && requestedPage > 1) ||
        requestedSort !== "curadoria";
      setExpanded(Boolean(hasQuery));
      setOnlyFavorites(false);
      if (force || hasQuery)
        void loadCatalog(
          {
            search: requestedSearch,
            category: requestedCategory,
            occasions: requestedOccasions,
            personalizable: requestedPersonalizable,
            quantity: requestedQuantity,
          },
          requestedPage,
          requestedSort,
          "replace",
        );
    };
    readDiscoveryUrl();
    const onPopState = () => readDiscoveryUrl(true);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      catalogRequestController.current?.abort();
    };
    // The URL is the source of truth for this one-time listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const missing = Object.keys(selected).filter((id) => !knownProducts[id]);
    if (!missing.length || missing.length > 24) return;
    const controller = new AbortController();
    fetch(`/api/catalog?ids=${missing.join(",")}&pageSize=24`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((page: CatalogPage | null) => {
        if (!page?.items) return;
        const returnedIds = new Set(page.items.map((product) => product.id));
        const removedIds = missing.filter((id) => !returnedIds.has(id));
        setKnownProducts((current) => ({
          ...current,
          ...Object.fromEntries(
            page.items.map((product) => [product.id, product]),
          ),
        }));
        if (removedIds.length) {
          setSelected((current) => {
            const next = { ...current };
            removedIds.forEach((id) => delete next[id]);
            return next;
          });
          setNotice(
            removedIds.length === 1
              ? "Uma peça da sua seleção não está mais disponível e foi removida."
              : "Algumas peças da sua seleção não estão mais disponíveis e foram removidas.",
          );
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [selected, knownProducts]);

  const filtered = useMemo(
    () =>
      (catalog?.items ?? []).filter(
        (product) => !onlyFavorites || favorites.includes(product.id),
      ),
    [catalog, onlyFavorites, favorites],
  );
  const resultCount = onlyFavorites ? filtered.length : (catalog?.total ?? 0);
  const discovery: CatalogDiscovery = {
    search,
    category,
    occasions,
    personalizable,
    quantity,
  };
  const activeFilterCount = countDiscoveryFilters(discovery);
  const visible =
    expanded || activeFilterCount > 0 || onlyFavorites
      ? filtered
      : filtered.slice(0, 4);
  const selection = Object.keys(selected)
    .map((id) => knownProducts[id])
    .filter((product): product is Product => Boolean(product));
  const markImageUnavailable = (image: string) =>
    setUnavailableImages((current) => {
      if (current.has(image)) return current;
      return new Set(current).add(image);
    });
  const imageIsUnavailable = (image: string) => unavailableImages.has(image);
  const updateDiscoveryUrl = (
    nextDiscovery: CatalogDiscovery,
    nextPage = 1,
    nextSort: "curadoria" | "nome" = sort,
    historyMode: DiscoveryHistoryMode = "push",
  ) => {
    const url = new URL(window.location.href);
    if (nextDiscovery.search.trim())
      url.searchParams.set("q", nextDiscovery.search.trim());
    else url.searchParams.delete("q");
    if (nextDiscovery.category !== "Todos")
      url.searchParams.set("categoria", nextDiscovery.category);
    else url.searchParams.delete("categoria");
    if (nextDiscovery.occasions.length)
      url.searchParams.set("ocasiao", nextDiscovery.occasions.join(","));
    else url.searchParams.delete("ocasiao");
    if (nextDiscovery.personalizable)
      url.searchParams.set("personalizavel", "1");
    else url.searchParams.delete("personalizavel");
    if (nextDiscovery.quantity !== null)
      url.searchParams.set("quantidade", String(nextDiscovery.quantity));
    else url.searchParams.delete("quantidade");
    if (nextPage > 1) url.searchParams.set("page", String(nextPage));
    else url.searchParams.delete("page");
    if (nextSort === "nome") url.searchParams.set("sort", "nome");
    else url.searchParams.delete("sort");
    if (historyMode === "push") window.history.pushState({}, "", url);
    else window.history.replaceState({}, "", url);
  };
  const scrollToCuration = () => {
    document.getElementById("curadoria")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };
  const closeMenuAndFocusCuration = () => {
    setMenuOpen(false);
    window.setTimeout(() => {
      scrollToCuration();
      document.getElementById("curation-title")?.focus({ preventScroll: true });
    }, 0);
  };
  async function loadCatalog(
    nextDiscovery: CatalogDiscovery = discovery,
    nextPage = 1,
    nextSort = sort,
    historyMode: DiscoveryHistoryMode = "push",
    selectedIds: readonly string[] = [],
  ) {
    const startedAt = performance.now();
    const requestId = ++catalogRequestId.current;
    catalogRequestController.current?.abort();
    const controller = new AbortController();
    catalogRequestController.current = controller;
    const params = new URLSearchParams({ page: String(Math.max(1, nextPage)) });
    if (selectedIds.length) {
      params.set("ids", selectedIds.join(","));
      params.set("pageSize", "24");
    } else {
      if (nextDiscovery.search.trim())
        params.set("q", nextDiscovery.search.trim());
      if (nextDiscovery.category !== "Todos")
        params.set("category", nextDiscovery.category);
      if (nextDiscovery.occasions.length)
        params.set("occasion", nextDiscovery.occasions.join(","));
      if (nextDiscovery.personalizable) params.set("personalizable", "1");
      if (nextDiscovery.quantity !== null)
        params.set("quantity", String(nextDiscovery.quantity));
    }
    if (nextSort === "nome") params.set("sort", "nome");
    // Reflect the user's intent synchronously; the source response later
    // normalizes an out-of-range page without leaving a stale search URL.
    setSearch(nextDiscovery.search);
    setCategory(nextDiscovery.category);
    setOccasions(nextDiscovery.occasions);
    setPersonalizable(nextDiscovery.personalizable);
    setQuantity(nextDiscovery.quantity);
    setSort(nextSort);
    updateDiscoveryUrl(nextDiscovery, nextPage, nextSort, historyMode);
    setCatalogLoading(true);
    setCatalogError(false);
    try {
      const response = await fetch(`/api/catalog?${params}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Catalog request failed");
      const next = (await response.json()) as CatalogPage;
      if (requestId !== catalogRequestId.current) return;
      setCatalog(next);
      setKnownProducts((current) => ({
        ...current,
        ...Object.fromEntries(
          next.items.map((product) => [product.id, product]),
        ),
      }));
      setSort(next.sort);
      updateDiscoveryUrl(nextDiscovery, next.page, next.sort, "replace");
      window.dispatchEvent(
        new CustomEvent("promo:catalog-filter", {
          detail: {
            dimensions: [
              selectedIds.length > 0 && "favorites",
              nextDiscovery.search && "search",
              nextDiscovery.category !== "Todos" && "category",
              nextDiscovery.occasions.length > 0 && "occasion",
              nextDiscovery.personalizable && "personalizable",
              nextDiscovery.quantity !== null && "quantity",
            ].filter(Boolean),
            resultCount: next.total,
            durationMs: Math.round(performance.now() - startedAt),
            success: true,
          },
        }),
      );
    } catch {
      if (requestId === catalogRequestId.current) {
        setCatalogError(true);
        window.dispatchEvent(
          new CustomEvent("promo:catalog-filter", {
            detail: {
              dimensions: [
                selectedIds.length > 0 && "favorites",
                nextDiscovery.search && "search",
                nextDiscovery.category !== "Todos" && "category",
                nextDiscovery.occasions.length > 0 && "occasion",
                nextDiscovery.personalizable && "personalizable",
                nextDiscovery.quantity !== null && "quantity",
              ].filter(Boolean),
              durationMs: Math.round(performance.now() - startedAt),
              success: false,
            },
          }),
        );
      }
    } finally {
      if (requestId === catalogRequestId.current) {
        catalogRequestController.current = null;
        setCatalogLoading(false);
      }
    }
  }
  function showFavorites() {
    const cleanDiscovery: CatalogDiscovery = {
      search: "",
      category: "Todos",
      occasions: [],
      personalizable: false,
      quantity: null,
    };
    setOnlyFavorites(true);
    setExpanded(true);
    void loadCatalog(cleanDiscovery, 1, sort, "push", favorites.slice(0, 24));
    scrollToCuration();
  }
  const openProject = () => {
    setStep(1);
    setProtocol(null);
    setDeliveryPending(false);
    setSelectionIssue("");
    setDrawer(true);
  };
  const addProduct = (p: Product) => {
    setSelected((prev) => ({
      ...prev,
      [p.id]: prev[p.id] ?? Math.max(1, p.minimum ?? 1),
    }));
    setNotice(`${p.name} adicionado à sua seleção.`);
  };
  const toggleFavorite = (p: Product) => {
    if (!favorites.includes(p.id) && favorites.length >= 24) {
      setNotice(
        "Você pode guardar até 24 peças nos favoritos desta curadoria.",
      );
      return;
    }
    setFavorites((prev) =>
      prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id],
    );
  };
  const browse = (value: string) => {
    setOnlyFavorites(false);
    const nextCategory = categories.includes(
      value as (typeof categories)[number],
    )
      ? (value as (typeof categories)[number])
      : "Todos";
    void loadCatalog({
      search: "",
      category: nextCategory,
      occasions: [],
      personalizable: false,
      quantity: null,
    });
    if (menuOpen) closeMenuAndFocusCuration();
    else scrollToCuration();
  };

  async function verifySelectedProducts(): Promise<VerifiedSelection | null> {
    const quantities = { ...selectedRef.current };
    const ids = Object.keys(quantities);
    if (!ids.length) return { products: [], quantities };
    if (ids.length > 24) {
      setSelectionIssue(
        "Sua seleção excede 24 peças. Remova algumas para continuar.",
      );
      setStep(1);
      return null;
    }
    try {
      const response = await fetch(
        `/api/catalog?ids=${ids.join(",")}&pageSize=24`,
        { cache: "no-store", headers: { Accept: "application/json" } },
      );
      if (!response.ok) throw new Error("CATALOG_UNAVAILABLE");
      const page = (await response.json()) as CatalogPage;
      if (
        page.contractVersion !== CATALOG_CONTRACT_VERSION ||
        page.page !== 1 ||
        page.total !== page.items?.length ||
        page.items.some((product) => !ids.includes(product.id)) ||
        new Set(page.items.map((product) => product.id)).size !==
          page.items.length
      )
        throw new Error("CATALOG_CONTRACT_INVALID");
      if (JSON.stringify(quantities) !== JSON.stringify(selectedRef.current)) {
        setSelectionIssue(
          "Sua seleção mudou durante a conferência. Tente novamente.",
        );
        setStep(1);
        return null;
      }
      const byId = new Map(page.items.map((product) => [product.id, product]));
      const missing = ids.filter((id) => !byId.has(id));
      const raisedMinimum = ids.filter((id) => {
        const product = byId.get(id);
        return product && quantities[id] < product.minimum;
      });
      setKnownProducts((current) => ({
        ...current,
        ...Object.fromEntries(
          page.items.map((product) => [product.id, product]),
        ),
      }));
      if (missing.length || raisedMinimum.length) {
        setSelected((current) => {
          if (JSON.stringify(current) !== JSON.stringify(quantities))
            return current;
          const next = { ...current };
          missing.forEach((id) => delete next[id]);
          raisedMinimum.forEach((id) => {
            next[id] = byId.get(id)!.minimum;
          });
          return next;
        });
        setSelectionIssue(
          missing.length
            ? "Uma peça saiu da curadoria e foi removida. Revise sua seleção antes de continuar."
            : "O mínimo de uma peça mudou. Ajustamos a quantidade; revise antes de continuar.",
        );
        setStep(1);
        return null;
      }
      setSelectionIssue("");
      return { products: ids.map((id) => byId.get(id)!), quantities };
    } catch {
      setSelectionIssue(
        "Não foi possível conferir sua seleção no catálogo agora. Tente novamente antes de preparar o briefing.",
      );
      setStep(1);
      return null;
    }
  }

  function briefingLines(
    briefing: BriefingPayload,
    verified: VerifiedSelection,
  ) {
    return [
      "PROMO BRINDES PREMIUM — BRIEFING DE PROJETO",
      `Preparado em: ${new Date().toLocaleDateString("pt-BR")}`,
      `Responsável: ${briefing.name}`,
      `Empresa: ${briefing.company}`,
      `E-mail: ${briefing.email}`,
      `Ocasião: ${briefing.occasion}`,
      `Recebimento desejado: ${briefing.date || "A definir"}`,
      `Data do evento: ${briefing.eventDate || "A definir"}`,
      `Flexibilidade no recebimento: ${briefing.deadlineFlexibility ? briefingContextLabels.deadlineFlexibility[briefing.deadlineFlexibility] : "A definir"}`,
      briefing.budget
        ? `Investimento ${briefing.budgetScope === "total" ? "total da ação" : "por presente"}: ${briefing.budget}`
        : "Investimento: A definir",
      `Canal de retorno: ${briefing.contactChannel ? briefingContextLabels.contactChannel[briefing.contactChannel] : "A definir"}`,
      `Telefone: ${briefing.phone || "Não informado"}`,
      `Identidade visual: ${briefing.logoStatus ? briefingContextLabels.logoStatus[briefing.logoStatus] : "A definir"}`,
      "",
      "SELEÇÃO DE PRODUTOS",
      ...verified.products.map(
        (p) =>
          `${p.originalName} | SKU ${p.sku} | ID ${p.id} | ${verified.quantities[p.id]} unidades`,
      ),
      ...(verified.products.length
        ? []
        : ["Curadoria aberta: solicitar recomendação de produtos."]),
      "",
      `Mensagem e personalização: ${briefing.message || "A definir"}`,
      "",
      "Documento de intenção, sem reserva de estoque ou confirmação de preço, técnica e prazo.",
      "Peças conferidas no catálogo ao preparar este arquivo. Revalidar antes de orçar.",
      "Este briefing foi gerado localmente e não foi enviado à equipe comercial.",
    ];
  }

  async function createBriefing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const contact = String(data.get("name") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    if (!contact || !company) {
      setNotice("Preencha seu nome e empresa.");
      return;
    }
    setSubmitting(true);
    try {
      const verified = await verifySelectedProducts();
      if (!verified) return;
      const candidate = {
        name: contact,
        company,
        email: String(data.get("email") ?? ""),
        occasion,
        date: String(data.get("date") ?? ""),
        budget: String(data.get("budget") ?? ""),
        budgetScope: data.get("budget")
          ? String(data.get("budgetScope") ?? "")
          : "",
        eventDate: String(data.get("eventDate") ?? ""),
        deadlineFlexibility: String(data.get("deadlineFlexibility") ?? ""),
        contactChannel: String(data.get("contactChannel") ?? ""),
        phone: String(data.get("phone") ?? ""),
        logoStatus: String(data.get("logoStatus") ?? ""),
        message: String(data.get("message") ?? ""),
        items: verified.products.map((p) => ({
          productId: p.id,
          quantity: verified.quantities[p.id],
        })),
      };
      const parsed = parseBriefingInput(candidate);
      if (!parsed.ok) {
        setNotice(parsed.message);
        return;
      }
      const lines = briefingLines(parsed.value, verified);
      if (!deliveryConfigured) {
        downloadText("briefing-promo-premium.txt", lines.join("\n"));
        setProtocol(null);
        setStep(3);
        return;
      }
      const requestKey =
        idempotencyKey ?? `briefing-${crypto.randomUUID().replaceAll("-", "")}`;
      if (!idempotencyKey) setIdempotencyKey(requestKey);
      const response = await fetch("/api/briefings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestKey,
        },
        body: JSON.stringify(parsed.value),
      });
      const result: {
        protocol?: string;
        error?: string;
        message?: string;
        pending?: boolean;
      } = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.error === "DESTINATION_UNAVAILABLE") {
          setDeliveryConfigured(false);
          downloadText("briefing-promo-premium.txt", lines.join("\n"));
          setProtocol(null);
          setStep(3);
          return;
        }
        if (
          result.error === "BRIEFING_PENDING" &&
          validProtocol(result.protocol)
        ) {
          setProtocol(result.protocol);
          setDeliveryPending(true);
          setStep(3);
          return;
        }
        throw new Error(result.message || result.error || "Falha ao enviar");
      }
      if (!validProtocol(result.protocol))
        throw new Error("BRIEFING_PROTOCOL_INVALID");
      setProtocol(result.protocol);
      setDeliveryPending(result.pending === true);
      setStep(3);
    } catch (error) {
      setNotice(
        error instanceof Error && error.message === "BRIEFING_PROTOCOL_INVALID"
          ? "Não foi possível confirmar o protocolo. Tente novamente."
          : "Não foi possível enviar agora. Revise sua conexão e tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="announcement">
        <span>UM GESTO. INFINITAS CONEXÕES.</span>
        <span className="announcement-right">
          PRESENTES CORPORATIVOS COM PROPÓSITO <Sparkles size={12} />
        </span>
      </div>
      <header className="site-header">
        <Link href="/" className="brand">
          <span className="brand-emblem" aria-hidden="true">
            p<span>.</span>
          </span>
          <span className="brand-name">
            PROMO BRINDES<span>PREMIUM COLLECTION</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#curadoria">
            A curadoria <ChevronDown size={12} />
          </a>
          <a href="#colecoes">Coleções</a>
          <Link href="/catalogos">Catálogos</Link>
          <a href="#personalizacao">Sua marca, em cada detalhe</a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Buscar presentes"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={20} />
          </button>
          <button
            className="icon-button favorites-trigger"
            aria-label="Ver favoritos"
            onClick={showFavorites}
          >
            <Heart size={20} />
          </button>
          <button
            className="selection-trigger"
            onClick={openProject}
            aria-label={`Minha seleção, ${selection.length} produtos`}
          >
            <ShoppingBag size={19} />
            <span>Minha seleção</span>
            <b>{selection.length}</b>
          </button>
          <button
            className="icon-button mobile-menu"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={23} />
          </button>
        </div>
      </header>

      <main id="conteudo">
        <section className="hero" aria-labelledby="hero-title">
          {imageIsUnavailable("/images/hero-gifting.webp") ? (
            <div
              className="media-fallback hero-media-fallback"
              aria-hidden="true"
            />
          ) : (
            <Image
              className="hero-image"
              src="/images/hero-gifting.webp"
              alt="Composição conceitual de presente com caixa preta, caderno, caneta e garrafa com acabamento dourado"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              onError={() => markImageUnavailable("/images/hero-gifting.webp")}
            />
          )}
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">
              <span className="tiny-line" /> A ARTE DE PRESENTEAR
            </p>
            <h1 id="hero-title">
              Alguns presentes
              <br />
              levam sua marca.
              <br />
              <em>Outros, a eternizam.</em>
            </h1>
            <p className="hero-description">
              Peças escolhidas com intenção. Detalhes que contam
              <br className="desktop-break" /> sua história. Para relações que
              merecem o extraordinário.
            </p>
            <div className="hero-ctas">
              <a className="button button-gold" href="#curadoria">
                Explore a curadoria <ArrowRight size={17} />
              </a>
              <button className="text-button" onClick={openProject}>
                Crie um projeto exclusivo <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="hero-signature">
              <span className="signature-symbol" aria-hidden="true">
                ✧
              </span>
              <span>
                Escolhido com cuidado.
                <br />
                <strong>Feito para ser lembrado.</strong>
              </span>
            </div>
          </div>
          <div className="hero-bottom">
            <a href="#curadoria">
              <ArrowDown size={14} /> DESCUBRA O EXTRAORDINÁRIO
            </a>
            <span>COMPOSIÇÃO CONCEITUAL · PREMIUM COLLECTION</span>
          </div>
        </section>

        <section className="values-bar" aria-label="Nossa proposta">
          <span>
            <Sparkles size={20} /> Curadoria com intenção
          </span>
          <i />
          <span>
            <Gift size={20} /> Personalização com identidade
          </span>
          <i />
          <span>
            <PackageCheck size={20} /> Projetos pensados por inteiro
          </span>
          <i />
          <span className="values-end">
            O VALOR ESTÁ NOS DETALHES <ArrowUpRight size={15} />
          </span>
        </section>

        <section
          className="curation section-pad"
          id="curadoria"
          aria-labelledby="curation-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">ESCOLHAS QUE DIZEM MUITO</p>
              <h2 id="curation-title" tabIndex={-1}>
                O extraordinário está <em>na escolha.</em>
              </h2>
            </div>
            <p>
              Design, utilidade e significado.
              <br />
              Encontre o presente que traduz a sua marca.
            </p>
          </div>
          <div className="catalog-controls">
            <div
              className="category-tabs"
              role="group"
              aria-label="Filtrar por tipo de presente"
            >
              {categories.map((c) => (
                <button
                  key={c}
                  className={category === c ? "active" : ""}
                  aria-pressed={category === c}
                  aria-label={c}
                  onClick={() => {
                    setOnlyFavorites(false);
                    void loadCatalog({ ...discovery, category: c });
                    setExpanded(true);
                  }}
                >
                  {c}
                  {catalog?.facets.categories[c] !== undefined && (
                    <small aria-hidden="true">
                      {catalog.facets.categories[c]}
                    </small>
                  )}
                </button>
              ))}
            </div>
            <div className="catalog-discovery-actions">
              <label className="catalog-sort">
                <span>Ordenar</span>
                <select
                  value={sort}
                  onChange={(event) =>
                    void loadCatalog(
                      discovery,
                      1,
                      event.target.value === "nome" ? "nome" : "curadoria",
                    )
                  }
                >
                  <option value="curadoria">Curadoria</option>
                  <option value="nome">Nome</option>
                </select>
              </label>
              <button
                className="filter-button"
                onClick={() => setSearchOpen(true)}
              >
                <SlidersHorizontal size={15} /> Encontrar uma peça
                {activeFilterCount > 0 && (
                  <b className="filter-count">{activeFilterCount}</b>
                )}
              </button>
            </div>
          </div>
          {(activeFilterCount > 0 || onlyFavorites) && (
            <div className="active-filters">
              <div className="active-filter-summary">
                {onlyFavorites ? "Seus favoritos" : "Filtros aplicados"} ·{" "}
                {catalogLoading
                  ? "atualizando…"
                  : catalogError
                    ? "contagem indisponível"
                    : `${resultCount} ${resultCount === 1 ? "peça" : "peças"}`}
              </div>
              <div className="filter-chips" aria-label="Filtros aplicados">
                {search && (
                  <button
                    onClick={() =>
                      void loadCatalog({ ...discovery, search: "" })
                    }
                    aria-label={`Remover busca ${search}`}
                  >
                    Busca: {search} <X size={13} />
                  </button>
                )}
                {category !== "Todos" && (
                  <button
                    onClick={() =>
                      void loadCatalog({ ...discovery, category: "Todos" })
                    }
                    aria-label={`Remover tipo ${category}`}
                  >
                    {category} <X size={13} />
                  </button>
                )}
                {occasions.map((occasionSlug) => {
                  const label =
                    catalogCollections.find(
                      (collection) => collection.slug === occasionSlug,
                    )?.title ?? occasionSlug;
                  return (
                    <button
                      key={occasionSlug}
                      onClick={() =>
                        void loadCatalog({
                          ...discovery,
                          occasions: occasions.filter(
                            (value) => value !== occasionSlug,
                          ),
                        })
                      }
                      aria-label={`Remover ocasião ${label}`}
                    >
                      {label} <X size={13} />
                    </button>
                  );
                })}
                {personalizable && (
                  <button
                    onClick={() =>
                      void loadCatalog({ ...discovery, personalizable: false })
                    }
                    aria-label="Remover filtro aceita personalização"
                  >
                    Personalizável <X size={13} />
                  </button>
                )}
                {quantity !== null && (
                  <button
                    onClick={() =>
                      void loadCatalog({ ...discovery, quantity: null })
                    }
                    aria-label={`Remover quantidade ${quantity}`}
                  >
                    Até mínimo de {quantity} <X size={13} />
                  </button>
                )}
              </div>
              <button
                className="clear-filters"
                onClick={() => {
                  setOnlyFavorites(false);
                  void loadCatalog({
                    search: "",
                    category: "Todos",
                    occasions: [],
                    personalizable: false,
                    quantity: null,
                  });
                }}
              >
                Limpar <X size={14} />
              </button>
            </div>
          )}
          {catalogLoading && (
            <p className="catalog-loading" role="status">
              Atualizando curadoria…
            </p>
          )}
          {!catalogLoading && !catalogError && catalog?.suggestedQuery && (
            <p className="catalog-suggestion" role="status">
              Nenhuma correspondência exata para “{catalog.query}”. Exibindo
              resultados de “{catalog.suggestedQuery}”.
            </p>
          )}
          <div className="product-grid" aria-busy={catalogLoading}>
            {!catalogError &&
              !catalogLoading &&
              visible.map((p) => (
                <article className="product-card" key={p.id}>
                  <div className="product-visual">
                    <button
                      className="product-image-button"
                      onClick={() => setDetail(p)}
                      aria-label={`Conhecer ${p.name}`}
                    >
                      {imageIsUnavailable(p.image) ? (
                        <span
                          className="media-fallback product-media-fallback"
                          data-testid="media-fallback"
                          role="img"
                          aria-label={`Imagem de ${p.name} temporariamente indisponível`}
                        >
                          <Gift aria-hidden="true" size={22} />
                          <span>Imagem indisponível</span>
                        </span>
                      ) : (
                        <Image
                          src={p.image}
                          alt={p.originalName}
                          fill
                          sizes="(max-width: 850px) 45vw, 23vw"
                          onError={() => markImageUnavailable(p.image)}
                        />
                      )}
                    </button>
                    <span className="product-tag">
                      {p.category === "Kits & experiências"
                        ? "O GESTO COMPLETO"
                        : p.category.toUpperCase()}
                    </span>
                    <button
                      className={`favorite-button ${favorites.includes(p.id) ? "is-favorite" : ""}`}
                      aria-label={`${favorites.includes(p.id) ? "Remover" : "Adicionar"} ${p.name} ${favorites.includes(p.id) ? "dos" : "aos"} favoritos`}
                      aria-pressed={favorites.includes(p.id)}
                      onClick={() => toggleFavorite(p)}
                    >
                      <Heart size={18} />
                    </button>
                    <span className="product-index">
                      Nº{" "}
                      {(
                        ((catalog?.page ?? 1) - 1) * (catalog?.pageSize ?? 12) +
                        filtered.indexOf(p) +
                        1
                      )
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  </div>
                  <div className="product-caption">
                    <div>
                      <p className="product-category">{p.category}</p>
                      <h3>
                        <button onClick={() => setDetail(p)}>{p.name}</button>
                      </h3>
                      <p className="product-tagline">{p.tagline}</p>
                      <Link
                        className="product-permalink"
                        href={`/produtos/${p.slug}`}
                      >
                        Ver ficha da peça <ArrowRight size={13} />
                      </Link>
                    </div>
                    <button
                      className={`add-button ${selected[p.id] ? "is-added" : ""}`}
                      aria-label={`${selected[p.id] ? "Ver seleção com" : "Adicionar"} ${p.name}${selected[p.id] ? "" : " à seleção"}`}
                      onClick={() =>
                        selected[p.id] ? openProject() : addProduct(p)
                      }
                    >
                      {selected[p.id] ? (
                        <Check size={19} />
                      ) : (
                        <Plus size={20} />
                      )}
                    </button>
                  </div>
                </article>
              ))}
          </div>
          {catalogError ? (
            <div className="empty-state" role="status">
              <Search size={28} />
              <h3>
                {networkOnline
                  ? "Não foi possível consultar a curadoria agora."
                  : "Você está sem conexão no momento."}
              </h3>
              <p>
                {networkOnline
                  ? "Sua seleção local continua preservada. Tente atualizar a consulta."
                  : "Sua seleção local continua preservada. Reconecte-se e atualize a consulta."}
              </p>
              <button
                className="button button-outline"
                onClick={() =>
                  void (onlyFavorites
                    ? loadCatalog(
                        {
                          search: "",
                          category: "Todos",
                          occasions: [],
                          personalizable: false,
                          quantity: null,
                        },
                        1,
                        sort,
                        "replace",
                        favorites.slice(0, 24),
                      )
                    : loadCatalog(
                        discovery,
                        catalog?.page ?? 1,
                        sort,
                        "replace",
                      ))
                }
                disabled={catalogLoading}
              >
                {catalogLoading ? "Consultando…" : "Tentar novamente"}
              </button>
            </div>
          ) : (
            filtered.length === 0 && (
              <div className="empty-state">
                <Search size={28} />
                <h3>
                  {onlyFavorites
                    ? "Sua curadoria começa com uma escolha."
                    : "Vamos encontrar outra possibilidade."}
                </h3>
                <p>
                  {onlyFavorites
                    ? "Toque no coração das peças que mais combinam com sua marca."
                    : "Tente buscar por “caderno”, “garrafa” ou por um SKU."}
                </p>
                <button
                  className="button button-outline"
                  onClick={() => {
                    setOnlyFavorites(false);
                    void loadCatalog({
                      search: "",
                      category: "Todos",
                      occasions: [],
                      personalizable: false,
                      quantity: null,
                    });
                  }}
                >
                  Explorar todas as peças <ArrowRight size={16} />
                </button>
              </div>
            )
          )}
          {!catalogError &&
            !expanded &&
            !search &&
            !onlyFavorites &&
            category === "Todos" && (
              <div className="catalog-more">
                <button
                  className="text-button"
                  onClick={() => setExpanded(true)}
                >
                  Conheça toda a seleção <ArrowRight size={17} />
                </button>
                <span>8 PEÇAS. MUITAS POSSIBILIDADES.</span>
              </div>
            )}
          {!catalogError &&
            expanded &&
            !onlyFavorites &&
            (catalog?.totalPages ?? 1) > 1 && (
              <nav
                className="catalog-pagination"
                aria-label="Paginação da curadoria"
              >
                <button
                  className="text-button"
                  disabled={(catalog?.page ?? 1) <= 1 || catalogLoading}
                  onClick={() =>
                    void loadCatalog(discovery, (catalog?.page ?? 1) - 1)
                  }
                >
                  Anterior
                </button>
                <span>
                  Página {catalog?.page} de {catalog?.totalPages}
                </span>
                <button
                  className="text-button"
                  disabled={
                    (catalog?.page ?? 1) >= (catalog?.totalPages ?? 1) ||
                    catalogLoading
                  }
                  onClick={() =>
                    void loadCatalog(discovery, (catalog?.page ?? 1) + 1)
                  }
                >
                  Próxima
                </button>
              </nav>
            )}
        </section>

        <section
          className="collections section-pad"
          id="colecoes"
          aria-labelledby="collections-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">PARA CADA MOMENTO, UM SIGNIFICADO</p>
              <h2 id="collections-title">
                Mais que presentes.
                <br />
                <em>Boas histórias para contar.</em>
              </h2>
            </div>
            <p>
              A primeira impressão. Uma conquista.
              <br />
              Um obrigado que permanece.
            </p>
          </div>
          <div className="collection-grid">
            <button
              className="collection-card collection-dark"
              onClick={() => browse("Kits & experiências")}
            >
              <Image
                src="/images/hero-gifting.webp"
                alt="Caixa de presentes na composição conceitual da coleção"
                fill
                sizes="(max-width: 750px) 100vw, 50vw"
              />
              <div className="collection-overlay" />
              <span className="collection-copy">
                <small>CONEXÕES QUE PERMANECEM</small>
                <strong>Gestos de reconhecimento</strong>
                <span>
                  Para quem faz parte da sua história <ArrowUpRight size={23} />
                </span>
              </span>
            </button>
            <button
              className="collection-card collection-light"
              onClick={() => browse("Viagem")}
            >
              <Image
                src="/images/mochila.webp"
                alt="Mochila preta da seleção executiva"
                fill
                sizes="(max-width: 750px) 55vw, 30vw"
              />
              <span className="collection-copy">
                <small>UM NOVO CAPÍTULO</small>
                <strong>Para ir mais longe</strong>
                <span>
                  Novas jornadas. A mesma essência. <ArrowUpRight size={23} />
                </span>
              </span>
            </button>
          </div>
        </section>

        <section
          className="personalization section-pad"
          id="personalizacao"
          aria-labelledby="personalization-title"
        >
          <div className="personalization-art">
            <Image
              src="/images/caderno.webp"
              alt="Caderno A5 preto em tecido PET reciclado, peça da curadoria"
              fill
              sizes="(max-width: 750px) 100vw, 45vw"
            />
            <span className="art-caption">TEXTURA. PRESENÇA. IDENTIDADE.</span>
            <span className="art-number" aria-hidden="true">
              01 / ∞
            </span>
          </div>
          <div className="personalization-copy">
            <p className="eyebrow">SINGULAR, COMO A SUA MARCA</p>
            <h2 id="personalization-title">
              O detalhe transforma.
              <br />
              <em>A intenção, também.</em>
            </h2>
            <p>
              Uma textura que surpreende. Uma gravação sutil. Uma mensagem que
              faz sentido. Seu presente pode contar uma história antes mesmo de
              ser aberto.
            </p>
            <ul className="craft-list">
              <li>
                <span>01</span> A peça que representa sua intenção
              </li>
              <li>
                <span>02</span> A personalização que revela sua identidade
              </li>
              <li>
                <span>03</span> A apresentação que completa a experiência
              </li>
            </ul>
            <button className="button button-gold" onClick={openProject}>
              Dê forma à sua ideia <ArrowUpRight size={17} />
            </button>
            <small>
              Possibilidades de personalização sob consulta para cada peça.
            </small>
          </div>
        </section>

        <section
          className="process section-pad"
          aria-labelledby="process-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">DO PRIMEIRO INSIGHT AO ÚLTIMO DETALHE</p>
              <h2 id="process-title">
                Seu próximo gesto. <em>Bem pensado.</em>
              </h2>
            </div>
          </div>
          <div className="process-grid">
            {[
              [
                "01",
                "Inspire-se",
                "Explore a curadoria e salve as peças que combinam com a sua marca.",
              ],
              [
                "02",
                "Conte sua ideia",
                "Reúna ocasião, quantidade, data desejada e o que quer transmitir.",
              ],
              [
                "03",
                "Construa o projeto",
                "Use o briefing para alinhar a proposta, os detalhes e a aprovação com o comercial.",
              ],
            ].map(([n, t, d]) => (
              <div className="process-step" key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="faq section-pad" aria-labelledby="faq-title">
          <div>
            <p className="eyebrow">CUIDADO TAMBÉM É CLAREZA</p>
            <h2 id="faq-title">
              Cada detalhe,
              <br />
              <em>bem resolvido.</em>
            </h2>
          </div>
          <div className="faq-list">
            {faq.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="closing section-pad">
          <span aria-hidden="true">✧</span>
          <p className="eyebrow">RELAÇÕES EXTRAORDINÁRIAS MERECEM</p>
          <h2>
            Um presente à altura
            <br />
            <em>da sua intenção.</em>
          </h2>
          <button className="button button-gold" onClick={openProject}>
            Vamos criar algo memorável <ArrowUpRight size={17} />
          </button>
        </section>
      </main>
      <footer className="site-footer section-pad">
        <div className="footer-top">
          <Link href="/" className="brand">
            <span className="brand-emblem" aria-hidden="true">
              p<span>.</span>
            </span>
            <span className="brand-name">
              PROMO BRINDES<span>PREMIUM COLLECTION</span>
            </span>
          </Link>
          <p>
            Presentes que aproximam.
            <br />
            Detalhes que permanecem.
          </p>
          <nav aria-label="Navegação do rodapé">
            <a href="#curadoria">A curadoria</a>
            <Link href="/catalogos">Catálogos</Link>
            <a href="#personalizacao">Personalização</a>
            <button onClick={openProject}>Seu projeto</button>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Promo Brindes · Conceito Premium
          </span>
          <span>
            Catálogo selecionado em 20.09.2026 · Disponibilidade sob consulta
          </span>
          <Link href="/privacidade">Privacidade</Link>
        </div>
      </footer>
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <Check size={17} />
            {notice}
          </>
        )}
      </div>

      {menuOpen && (
        <Modal
          title="Menu principal"
          onClose={() => setMenuOpen(false)}
          className="menu-modal"
        >
          <p className="eyebrow">PROMO BRINDES PREMIUM</p>
          <h2>Encontre sua inspiração.</h2>
          <nav className="mobile-nav" aria-label="Menu móvel">
            <button
              onClick={() => {
                showFavorites();
                closeMenuAndFocusCuration();
              }}
            >
              Meus favoritos <Heart />
            </button>
            <button onClick={() => browse("Todos")}>
              A curadoria <ArrowRight />
            </button>
            <a href="#colecoes" onClick={() => setMenuOpen(false)}>
              Coleções <ArrowRight />
            </a>
            <Link href="/catalogos" onClick={() => setMenuOpen(false)}>
              Catálogos <ArrowRight />
            </Link>
            <a href="#personalizacao" onClick={() => setMenuOpen(false)}>
              Personalização <ArrowRight />
            </a>
            <button
              onClick={() => {
                setMenuOpen(false);
                openProject();
              }}
            >
              Meu projeto <ArrowRight />
            </button>
          </nav>
        </Modal>
      )}

      {searchOpen && (
        <Modal
          title="Filtrar curadoria"
          onClose={() => setSearchOpen(false)}
          className="catalog-filter-modal"
        >
          <CatalogFilters
            value={discovery}
            facets={catalog?.facets ?? null}
            resultCount={resultCount}
            loading={catalogLoading}
            error={catalogError}
            onChange={(nextDiscovery) => {
              setOnlyFavorites(false);
              setExpanded(true);
              void loadCatalog(nextDiscovery);
            }}
            onSearch={(nextDiscovery) => {
              setOnlyFavorites(false);
              setExpanded(true);
              void loadCatalog(nextDiscovery);
              setSearchOpen(false);
              scrollToCuration();
            }}
            onClear={() => {
              setOnlyFavorites(false);
              void loadCatalog({
                search: "",
                category: "Todos",
                occasions: [],
                personalizable: false,
                quantity: null,
              });
            }}
            onClose={() => {
              setSearchOpen(false);
              scrollToCuration();
            }}
          />
        </Modal>
      )}

      {detail && (
        <Modal
          title={detail.name}
          onClose={() => setDetail(null)}
          className="product-modal"
        >
          <div className="detail-image">
            {imageIsUnavailable(detail.image) ? (
              <span
                className="media-fallback detail-media-fallback"
                role="img"
                aria-label={`Imagem de ${detail.name} temporariamente indisponível`}
              >
                <Gift aria-hidden="true" size={28} />
                <span>Imagem temporariamente indisponível</span>
              </span>
            ) : (
              <Image
                src={detail.image}
                alt={detail.originalName}
                fill
                sizes="(max-width: 700px) 90vw, 450px"
                onError={() => markImageUnavailable(detail.image)}
              />
            )}
          </div>
          <div className="detail-copy">
            <p className="eyebrow">
              {detail.category} · REF. {detail.sku}
            </p>
            <h2>{detail.name}</h2>
            <p>{detail.description}</p>
            <dl>
              <div>
                <dt>Quantidade mínima cadastrada</dt>
                <dd>
                  {detail.minimum ?? 1}{" "}
                  {(detail.minimum ?? 1) === 1 ? "unidade" : "unidades"}
                </dd>
              </div>
              <div>
                <dt>Personalização</dt>
                <dd>
                  {detail.personalizable
                    ? "Possibilidades sob consulta"
                    : "Consultar alternativas"}
                </dd>
              </div>
              <div>
                <dt>Investimento e prazo</dt>
                <dd>Proposta sob medida</dd>
              </div>
            </dl>
            <button
              className="button button-gold"
              onClick={() => {
                addProduct(detail);
                setDetail(null);
              }}
            >
              Incluir no meu projeto <Plus size={17} />
            </button>
            <Link className="text-button" href={`/produtos/${detail.slug}`}>
              Ver ficha completa <ArrowRight size={16} />
            </Link>
            <p className="fine-print">
              Foto do fornecedor. Condições, materiais, cores e estoque sujeitos
              à confirmação comercial. Dados editoriais de{" "}
              {detail.sourceDate.split("-").reverse().join(".")}.
            </p>
          </div>
        </Modal>
      )}

      {drawer && (
        <Modal
          title="Seu projeto de presentes"
          onClose={() => setDrawer(false)}
          className="project-modal"
        >
          <p className="eyebrow">SEU PRÓXIMO GESTO</p>
          <h2>
            {step === 3 ? (
              <>
                Sua ideia, <em>bem apresentada.</em>
              </>
            ) : (
              <>
                Um projeto com <em>a sua essência.</em>
              </>
            )}
          </h2>
          {step !== 3 && (
            <div className="project-steps">
              <span className={step === 1 ? "active" : ""}>
                01 · Sua seleção
              </span>
              <span className={step === 2 ? "active" : ""}>
                02 · Seu briefing
              </span>
            </div>
          )}
          {step === 1 && (
            <>
              <div className="selection-list">
                {selection.length ? (
                  selection.map((p) => (
                    <div className="selection-item" key={p.id}>
                      {imageIsUnavailable(p.image) ? (
                        <span
                          className="media-fallback selection-media-fallback"
                          role="img"
                          aria-label={`Imagem de ${p.name} temporariamente indisponível`}
                        >
                          <Gift aria-hidden="true" size={18} />
                        </span>
                      ) : (
                        <Image
                          src={p.image}
                          alt=""
                          width={72}
                          height={72}
                          onError={() => markImageUnavailable(p.image)}
                        />
                      )}
                      <div className="selection-name">
                        <h3>{p.name}</h3>
                        <small>
                          REF. {p.sku} · MÍN. {p.minimum ?? 1} UN.
                        </small>
                        <button
                          onClick={() =>
                            setSelected((prev) => {
                              const next = { ...prev };
                              delete next[p.id];
                              return next;
                            })
                          }
                        >
                          Remover
                        </button>
                      </div>
                      <div className="quantity-control">
                        <button
                          aria-label={`Diminuir quantidade de ${p.name}`}
                          disabled={
                            selected[p.id] <= Math.max(1, p.minimum ?? 1)
                          }
                          onClick={() =>
                            setSelected((prev) => ({
                              ...prev,
                              [p.id]: Math.max(
                                Math.max(1, p.minimum ?? 1),
                                prev[p.id] - 1,
                              ),
                            }))
                          }
                        >
                          <Minus size={13} />
                        </button>
                        <label className="sr-only" htmlFor={`qty-${p.id}`}>
                          Quantidade de {p.name}
                        </label>
                        <input
                          id={`qty-${p.id}`}
                          type="number"
                          min={Math.max(1, p.minimum ?? 1)}
                          max={10000}
                          value={selected[p.id]}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            if (
                              Number.isInteger(n) &&
                              n >= Math.max(1, p.minimum ?? 1) &&
                              n <= 10000
                            )
                              setSelected((prev) => ({ ...prev, [p.id]: n }));
                          }}
                        />
                        <button
                          aria-label={`Aumentar quantidade de ${p.name}`}
                          disabled={selected[p.id] >= 10000}
                          onClick={() =>
                            setSelected((prev) => ({
                              ...prev,
                              [p.id]: Math.min(10000, prev[p.id] + 1),
                            }))
                          }
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Gift size={30} />
                    <h3>Ainda está buscando inspiração?</h3>
                    <p>
                      Você pode preparar um briefing aberto ou escolher suas
                      primeiras peças.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => {
                        setDrawer(false);
                        browse("Todos");
                      }}
                    >
                      Explorar a curadoria <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="project-summary">
                <span>
                  {selection.length}{" "}
                  {selection.length === 1
                    ? "peça selecionada"
                    : "peças selecionadas"}
                </span>
                <strong>Valores sob consulta</strong>
              </div>
              {selectionIssue && (
                <p className="selection-alert" role="status">
                  {selectionIssue}
                </p>
              )}
              {selection.length > 0 && (
                <button
                  className="text-button clear-selection"
                  onClick={() => {
                    setSelected({});
                    setNotice("Sua seleção foi limpa deste navegador.");
                  }}
                >
                  Limpar toda a seleção <X size={15} />
                </button>
              )}
              <button
                className="button button-gold full-width"
                onClick={() => setStep(2)}
              >
                Preparar meu briefing <ArrowRight size={17} />
              </button>
              <p className="fine-print">
                {deliveryConfigured
                  ? "O envio registra uma solicitação para análise comercial. Não é um pedido nem reserva estoque."
                  : "Nesta prévia, você poderá baixar seu briefing. Nenhum pedido será enviado."}
              </p>
            </>
          )}
          {step === 2 && (
            <form className="briefing-form" onSubmit={createBriefing}>
              <div className="form-row">
                <label>
                  Seu nome
                  <input
                    required
                    name="name"
                    pattern={".*\\S.*"}
                    autoComplete="name"
                    maxLength={120}
                    value={briefingDraft.name}
                    onChange={(event) => {
                      setBriefingDraft((draft) => ({
                        ...draft,
                        name: event.target.value,
                      }));
                      setIdempotencyKey(null);
                    }}
                  />
                </label>
                <label>
                  Empresa
                  <input
                    required
                    name="company"
                    pattern={".*\\S.*"}
                    autoComplete="organization"
                    maxLength={160}
                    value={briefingDraft.company}
                    onChange={(event) => {
                      setBriefingDraft((draft) => ({
                        ...draft,
                        company: event.target.value,
                      }));
                      setIdempotencyKey(null);
                    }}
                  />
                </label>
              </div>
              <label>
                E-mail corporativo
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={200}
                  value={briefingDraft.email}
                  onChange={(event) => {
                    setBriefingDraft((draft) => ({
                      ...draft,
                      email: event.target.value,
                    }));
                    setIdempotencyKey(null);
                  }}
                />
              </label>
              <label>
                O que vamos celebrar?
                <select
                  value={occasion}
                  onChange={(e) => {
                    setOccasion(e.target.value);
                    setIdempotencyKey(null);
                  }}
                >
                  <option>Relacionamento com clientes</option>
                  <option>Boas-vindas ao time</option>
                  <option>Eventos e lançamentos</option>
                  <option>Reconhecimento e conquistas</option>
                  <option>Fim de ano</option>
                  <option>Outro momento especial</option>
                </select>
              </label>
              <div className="form-row">
                <label>
                  Quando precisa receber? <small>(opcional)</small>
                  <input
                    type="date"
                    name="date"
                    min={
                      new Date(
                        Date.now() - new Date().getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                    value={briefingDraft.date}
                    onChange={(event) => {
                      setBriefingDraft((draft) => ({
                        ...draft,
                        date: event.target.value,
                      }));
                      setIdempotencyKey(null);
                    }}
                  />
                </label>
                <label>
                  Data do evento <small>(opcional)</small>
                  <input
                    type="date"
                    name="eventDate"
                    value={briefingDraft.eventDate}
                    onChange={(event) => {
                      setBriefingDraft((draft) => ({
                        ...draft,
                        eventDate: event.target.value,
                      }));
                      setIdempotencyKey(null);
                    }}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Investimento considerado <small>(opcional)</small>
                  {briefingDraft.budgetScope === "total" ? (
                    <input
                      name="budget"
                      inputMode="text"
                      maxLength={80}
                      placeholder="Ex.: R$ 15.000 para toda a ação"
                      value={briefingDraft.budget}
                      onChange={(event) => {
                        setBriefingDraft((draft) => ({
                          ...draft,
                          budget: event.target.value,
                        }));
                        setIdempotencyKey(null);
                      }}
                    />
                  ) : (
                    <select
                      name="budget"
                      value={briefingDraft.budget}
                      onChange={(event) => {
                        setBriefingDraft((draft) => ({
                          ...draft,
                          budget: event.target.value,
                        }));
                        setIdempotencyKey(null);
                      }}
                    >
                      <option value="">A definir</option>
                      <option>Até R$ 100</option>
                      <option>R$ 100 a R$ 250</option>
                      <option>R$ 250 a R$ 500</option>
                      <option>Acima de R$ 500</option>
                    </select>
                  )}
                </label>
                <label>
                  Esse valor é para <small>(opcional)</small>
                  <select
                    name="budgetScope"
                    value={briefingDraft.budgetScope}
                    onChange={(event) => {
                      setBriefingDraft((draft) => ({
                        ...draft,
                        budgetScope: event.target
                          .value as BriefingDraft["budgetScope"],
                        budget: "",
                      }));
                      setIdempotencyKey(null);
                    }}
                  >
                    <option value="per-gift">Cada presente</option>
                    <option value="total">Toda a ação</option>
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Flexibilidade de recebimento <small>(opcional)</small>
                  <select
                    name="deadlineFlexibility"
                    value={briefingDraft.deadlineFlexibility}
                    onChange={(event) => {
                      setBriefingDraft((draft) => ({
                        ...draft,
                        deadlineFlexibility: event.target.value,
                      }));
                      setIdempotencyKey(null);
                    }}
                  >
                    <option value="">Ainda vou confirmar</option>
                    <option value="flexible">Data flexível</option>
                    <option value="fixed">Data fixa</option>
                  </select>
                </label>
                <label>
                  Como prefere o retorno? <small>(opcional)</small>
                  <select
                    name="contactChannel"
                    value={briefingDraft.contactChannel}
                    onChange={(event) => {
                      setBriefingDraft((draft) => ({
                        ...draft,
                        contactChannel: event.target.value,
                      }));
                      setIdempotencyKey(null);
                    }}
                  >
                    <option value="">Sem preferência</option>
                    <option value="email">E-mail</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Telefone</option>
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Telefone <small>(necessário para WhatsApp ou ligação)</small>
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    maxLength={24}
                    required={
                      briefingDraft.contactChannel === "whatsapp" ||
                      briefingDraft.contactChannel === "phone"
                    }
                    value={briefingDraft.phone}
                    onChange={(event) => {
                      setBriefingDraft((draft) => ({
                        ...draft,
                        phone: event.target.value,
                      }));
                      setIdempotencyKey(null);
                    }}
                  />
                </label>
                <label>
                  Sua identidade visual <small>(opcional)</small>
                  <select
                    name="logoStatus"
                    value={briefingDraft.logoStatus}
                    onChange={(event) => {
                      setBriefingDraft((draft) => ({
                        ...draft,
                        logoStatus: event.target.value,
                      }));
                      setIdempotencyKey(null);
                    }}
                  >
                    <option value="">Ainda vou definir</option>
                    <option value="ready">Logo pronto</option>
                    <option value="in-progress">Identidade em criação</option>
                    <option value="need-help">Quero orientação visual</option>
                  </select>
                </label>
              </div>
              <label>
                Conte a sua ideia <small>(opcional)</small>
                <textarea
                  name="message"
                  rows={3}
                  maxLength={2000}
                  placeholder="Mensagem, cores, embalagem, destino…"
                  value={briefingDraft.message}
                  onChange={(event) => {
                    setBriefingDraft((draft) => ({
                      ...draft,
                      message: event.target.value,
                    }));
                    setIdempotencyKey(null);
                  }}
                />
              </label>
              <p className="fine-print">
                {deliveryConfigured
                  ? "Ao enviar, seus dados seguem ao canal comercial configurado para esta solicitação. A confirmação só aparece após a resposta do servidor."
                  : "Seus dados serão usados apenas no arquivo que você baixar. Esta prévia não envia o briefing nem armazena dados de contato."}
              </p>
              <div className="form-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </button>
                <button
                  className="button button-gold"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Conferindo seleção…"
                    : deliveryConfigured
                      ? "Enviar ao comercial"
                      : "Baixar meu briefing"}
                  {deliveryConfigured ? (
                    <ArrowRight size={17} />
                  ) : (
                    <Download size={17} />
                  )}
                </button>
              </div>
            </form>
          )}
          {step === 3 && (
            <div className="briefing-success">
              <div className="success-icon">
                <Check size={30} />
              </div>
              <h3>Seu briefing está pronto.</h3>
              <p>
                {protocol
                  ? deliveryPending
                    ? `Seu briefing foi registrado com o protocolo ${protocol}. A entrega ao comercial está pendente e será conciliada com segurança.`
                    : `Sua solicitação foi recebida. Protocolo: ${protocol}.`
                  : "O arquivo foi preparado para download. Você pode compartilhá-lo com a equipe comercial para dar continuidade ao projeto."}
              </p>
              <p className="fine-print">
                {protocol
                  ? deliveryPending
                    ? "Você pode manter este protocolo. Não envie uma nova solicitação enquanto a equipe confirma a continuidade."
                    : "A proposta, disponibilidade, personalização e prazo continuam sujeitos à confirmação comercial."
                  : "Nenhum pedido foi enviado. A seleção continua salva neste navegador."}
              </p>
              <button
                className="button button-gold"
                onClick={() => setDrawer(false)}
              >
                Continuar explorando <ArrowRight size={17} />
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setBriefingDraft(emptyBriefingDraft);
                  setIdempotencyKey(null);
                  setDeliveryPending(false);
                  setProtocol(null);
                  setStep(2);
                }}
              >
                Preparar outro briefing
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
