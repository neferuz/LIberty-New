import { ProductContent } from "@/components/pages/ProductContent";
import { notFound } from "next/navigation";

async function getProductBySku(sku: string) {
  try {
    // Port 8000 is our local backend port (mapped in Next.js rewrites)
    const res = await fetch(`http://127.0.0.1:8000/api/v1/products/${encodeURIComponent(sku)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch product by sku:", err);
    return null;
  }
}

async function getRecommended(categoryId: number, currentId: number) {
  try {
    // Port 8000 is our local backend port (mapped in Next.js rewrites)
    const res = await fetch(`http://127.0.0.1:8000/api/v1/products?category_id=${categoryId}&limit=5`, { cache: 'no-store' });
    if (!res.ok) return [];
    const products: any[] = await res.json();
    return products.filter(p => p.id !== currentId).slice(0, 4);
  } catch (err) {
    console.error("Failed to fetch recommended products:", err);
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const product = await getProductBySku(sku);
  
  if (!product) {
    notFound();
  }

  const recommended = await getRecommended(product.category_id, product.id);

  return <ProductContent product={product} recommended={recommended} />;
}
