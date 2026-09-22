import Storefront from "@/components/Storefront";
import { getSiteCatalogPage } from "@/lib/site-database";

export const revalidate = 60;

export default async function Home() {
  try {
    return <Storefront initialCatalog={await getSiteCatalogPage()} />;
  } catch {
    return <Storefront initialCatalog={null} />;
  }
}
