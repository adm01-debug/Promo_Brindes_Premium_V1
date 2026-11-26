import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OperationsConsole from "@/components/OperationsConsole";
import { consoleAccessConfig } from "@/lib/console-access.mjs";
import "./operacoes.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Console de operação | Promo Brindes Premium",
  alternates: { canonical: "/operacoes" },
  robots: { index: false, follow: false },
};

export default function OperacoesPage() {
  if (!consoleAccessConfig()) notFound();
  return <OperationsConsole />;
}