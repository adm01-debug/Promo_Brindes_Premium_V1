export const catalogThemes = [
  { id: "todos", label: "Todos os catálogos" },
  { id: "pessoas", label: "Pessoas & conquistas" },
  { id: "relacionamento", label: "Relações & encontros" },
  { id: "essenciais", label: "Essenciais da rotina" },
] as const;

export type CatalogTheme = (typeof catalogThemes)[number]["id"];
export type CatalogCollection = {
  slug: string;
  number: string;
  title: string;
  coverTitle: string;
  eyebrow: string;
  description: string;
  introduction: string;
  theme: Exclude<CatalogTheme, "todos">;
  tags: string[];
  aliases: string[];
  tone: "ivory" | "forest" | "charcoal" | "wine";
  productIds: string[];
  editedAt: string;
};

const ids = {
  executive: "0144f10f-c311-47eb-afd6-14b9ebef35b6",
  notebook: "03b447a0-930f-43f9-a51f-5fce910bfc4a",
  backpack: "015e9f0a-dd0f-444e-9a76-8404c2576ee6",
  bottle: "0111829b-9072-46cb-8cb9-9c620f55a14d",
  coffee: "01a22943-6283-4db0-b77b-3a8b56ca09fe",
  tea: "003c8bd0-8c02-46d2-9b6a-8464858fee97",
  gourmet: "02095e72-4ede-4e44-af95-8fc335015f94",
  pen: "03ad1da3-68c5-40ed-9465-e1aad642d384",
};

export const catalogCollections: readonly CatalogCollection[] = [
  {
    slug: "boas-vindas",
    number: "01",
    title: "Um começo com significado",
    coverTitle: "Novos começos.",
    eyebrow: "BOAS-VINDAS & CULTURA",
    description:
      "Peças para acolher pessoas e dar forma ao primeiro capítulo de uma nova jornada.",
    introduction:
      "Um caderno para as primeiras ideias, uma peça para a mesa e um cuidado para acompanhar a rotina. Esta seleção reúne referências para um gesto de boas-vindas com a identidade da sua empresa.",
    theme: "pessoas",
    tags: ["Onboarding", "Colaboradores", "Boas-vindas"],
    aliases: ["admissão", "equipe", "time", "cultura"],
    tone: "ivory",
    productIds: [ids.notebook, ids.executive, ids.bottle],
    editedAt: "2026-09-22",
  },
  {
    slug: "relacoes-que-permanecem",
    number: "02",
    title: "Relações que permanecem",
    coverTitle: "Gestos que ficam.",
    eyebrow: "CLIENTES & PARCEIROS",
    description:
      "O valor de um agradecimento, traduzido em presentes que encontram lugar no dia a dia.",
    introduction:
      "Relações se constroem em pequenos gestos. Explore referências para agradecer a confiança de clientes e parceiros, com espaço para uma mensagem e uma apresentação próprias da sua marca.",
    theme: "relacionamento",
    tags: ["Clientes", "Parceiros", "Agradecimento"],
    aliases: ["relacionamento", "fidelização", "obrigado"],
    tone: "forest",
    productIds: [ids.coffee, ids.tea, ids.pen],
    editedAt: "2026-09-22",
  },
  {
    slug: "conquistas-memoraveis",
    number: "03",
    title: "À altura de uma conquista",
    coverTitle: "Conquistas memoráveis.",
    eyebrow: "RECONHECIMENTO & LIDERANÇA",
    description:
      "Uma seleção para reconhecer trajetórias, celebrar marcos e agradecer a quem faz parte da história.",
    introduction:
      "Uma promoção, um ciclo concluído ou um marco de carreira. Encontre um ponto de partida para reconhecer a contribuição de uma pessoa com um presente escolhido para aquele momento.",
    theme: "pessoas",
    tags: ["Reconhecimento", "Liderança", "Tempo de casa"],
    aliases: ["metas", "premiação", "aniversário", "conquista"],
    tone: "charcoal",
    productIds: [ids.backpack, ids.executive, ids.gourmet],
    editedAt: "2026-09-22",
  },
  {
    slug: "arte-de-receber",
    number: "04",
    title: "A arte de receber",
    coverTitle: "Bons encontros.",
    eyebrow: "ENCONTROS & CELEBRAÇÕES",
    description:
      "Rituais de café, chá e mesa para ocasiões que merecem ser compartilhadas.",
    introduction:
      "Há presentes que convidam a uma pausa. Reunimos peças para encontros, celebrações e encerramentos de ciclo, com possibilidades que começam no café e chegam à mesa.",
    theme: "relacionamento",
    tags: ["Celebrações", "Café & chá", "Gourmet"],
    aliases: ["evento", "eventos", "natal", "final de ano", "confraternização"],
    tone: "wine",
    productIds: [ids.tea, ids.coffee, ids.gourmet],
    editedAt: "2026-09-22",
  },
  {
    slug: "escrita-com-presenca",
    number: "05",
    title: "Ideias merecem presença",
    coverTitle: "Próximas ideias.",
    eyebrow: "ESCRITA & ESCRITÓRIO",
    description:
      "Cadernos e instrumentos de escrita para acompanhar planos, conversas e novas ideias.",
    introduction:
      "Um espaço para registrar o que vem a seguir. Explore peças de escrita que podem compor o cotidiano de trabalho ou uma apresentação de marca pensada para uma ocasião especial.",
    theme: "essenciais",
    tags: ["Escrita", "Cadernos", "Escritório"],
    aliases: ["caneta", "caderno", "mesa", "reunião"],
    tone: "ivory",
    productIds: [ids.pen, ids.notebook],
    editedAt: "2026-09-22",
  },
  {
    slug: "novos-destinos",
    number: "06",
    title: "Para novos destinos",
    coverTitle: "Além da rotina.",
    eyebrow: "VIAGEM & MOVIMENTO",
    description:
      "Peças para quem leva ideias, projetos e a sua marca a outros lugares.",
    introduction:
      "Entre compromissos, deslocamentos e novas descobertas, a utilidade faz parte do gesto. Esta seleção reúne referências para acompanhar uma rotina em movimento.",
    theme: "essenciais",
    tags: ["Viagem", "Mobilidade", "Rotina"],
    aliases: ["mochila", "garrafa", "executivo", "viagens"],
    tone: "forest",
    productIds: [ids.backpack, ids.bottle],
    editedAt: "2026-09-22",
  },
];

export type CatalogSummary = CatalogCollection & {
  productCount: number | null;
  cover: { image: string; name: string } | null;
};

export function resolveCatalogTheme(
  value: string | null | undefined,
): CatalogTheme {
  return catalogThemes.some((theme) => theme.id === value)
    ? (value as CatalogTheme)
    : "todos";
}

export function filterCatalogs<T extends CatalogCollection>(
  collections: readonly T[],
  query: string,
  theme: CatalogTheme,
): T[] {
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  const terms = normalize(query.trim().slice(0, 80))
    .split(/\s+/)
    .filter(Boolean);
  return collections.filter((collection) => {
    if (theme !== "todos" && collection.theme !== theme) return false;
    const text = normalize(
      [
        collection.title,
        collection.eyebrow,
        collection.description,
        ...collection.tags,
        ...collection.aliases,
      ].join(" "),
    );
    return terms.every((term) => text.includes(term));
  });
}

export function getCatalogCollection(slug: string) {
  return catalogCollections.find((collection) => collection.slug === slug);
}
