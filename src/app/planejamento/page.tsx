import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlanDashboard from "@/components/PlanDashboard";
import plan from "@/lib/plan.json";
import { allowsPlanningDashboard } from "@/lib/planning-access.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plano de 200 etapas | Promo Brindes Premium",
  alternates: { canonical: "/planejamento" },
  robots: { index: false, follow: false },
};
export default function Planning() {
  if (!allowsPlanningDashboard()) notFound();
  return <PlanDashboard plan={plan} />;
}
