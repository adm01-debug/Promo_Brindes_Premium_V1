import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlanDashboard from "@/components/PlanDashboard";
import { isIndexableSite } from "@/lib/publication";
export const metadata: Metadata = {
  title: "Plano de 200 etapas | Promo Brindes Premium",
  alternates: { canonical: "/planejamento" },
  robots: { index: false, follow: false },
};
export default function Planning() {
  if (isIndexableSite()) notFound();
  return <PlanDashboard />;
}
