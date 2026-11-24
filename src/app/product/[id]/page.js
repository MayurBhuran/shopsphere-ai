
import { getProducts } from "@/services/productService";
import ProductDetailsClient from "@/component/products/ProductDetailsClient";

// Product details depend on live API data.
// Render this route at request time instead of prerendering it.
export const instant = false;

export default async function ProductPage({ params }) {
  const { id } = await params;

  let apiProducts = [];

  try {
    apiProducts = await getProducts();
  } catch (error) {
    console.error("Product loading error:", error);
  }

  return (
    <ProductDetailsClient
      productId={id}
      apiProducts={apiProducts}
    />
  );
}
