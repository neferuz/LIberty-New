import { ProductContent } from "@/components/pages/ProductContent";
import { notFound } from "next/navigation";

async function getProduct(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/v1/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch product:", err);
    return null;
  }
}

async function getRecommended(categoryId: number, currentId: number) {
  try {
    const res = await fetch(`http://localhost:8000/api/v1/products/?category_id=${categoryId}&limit=5`, { cache: 'no-store' });
    if (!res.ok) return [];
    const products: any[] = await res.json();
    return products.filter(p => p.id !== currentId).slice(0, 4);
  } catch (err) {
    console.error("Failed to fetch recommended products:", err);
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    notFound();
  }

  const recommended = await getRecommended(product.category_id, product.id);

  return <ProductContent product={product} recommended={recommended} />;
}
