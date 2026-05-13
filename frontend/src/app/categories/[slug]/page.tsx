import { products } from "@/constants/products";
import { CategoryContent } from "@/components/pages/CategoryContent";

const slugMap: Record<string, string> = {
  "suits": "Костюмы",
  "dresses": "Платья",
  "coats": "Пальто",
  "outerwear": "Верхняя одежда",
  "shirts": "Рубашки",
  "trousers": "Брюки"
};

export async function generateStaticParams() {
  return Object.keys(slugMap).map((slug) => ({
    slug: slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryTitle = slugMap[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);

  return <CategoryContent slug={slug} categoryTitle={categoryTitle} />;
}
