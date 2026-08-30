import ClientApp from "./ClientApp";
import HomeSeo from "@/components/HomeSeo";
import { fetchActiveTalents, comunasWithCounts, categoriesWithCounts } from "@/lib/landing";

export const revalidate = 3600;

export default async function Page() {
  let talents = [], comunas = [], categories = [];
  try {
    talents = await fetchActiveTalents();
    comunas = comunasWithCounts(talents).slice(0, 30);
    categories = categoriesWithCounts(talents).slice(0, 24);
  } catch {}

  return (
    <>
      {/* SEO layer: real content + crawlable links in the initial HTML.
          The client app removes #home-seo once it mounts. */}
      <div id="home-seo">
        <HomeSeo talents={talents} comunas={comunas} categories={categories} />
      </div>
      <ClientApp />
    </>
  );
}
