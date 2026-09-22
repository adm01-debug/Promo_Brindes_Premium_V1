import type { Metadata } from "next";
import PlanDashboard from "@/components/PlanDashboard";
export const metadata: Metadata = {
  title: "Plano de 200 etapas | Promo Brindes Premium",
  robots: { index: false, follow: false },
};
export default function Planning() {
  return <PlanDashboard />;
}
