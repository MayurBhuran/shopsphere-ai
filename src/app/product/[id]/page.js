
import { getProducts } from "@/services/productService";
import ProductDetailsClient from "@/component/products/ProductDetailsClient";

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
