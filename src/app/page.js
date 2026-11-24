
import Link from "next/link";
import ProductSection from "@/services/productSection";

export default function Home() {
  return (
    <main>
      <section className="min-h-[550px] bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <p className="text-blue-600 font-semibold mb-4">
            ✨ Smart Shopping Starts Here
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Discover Your Perfect Products
          </h1>

          <p className="mt-6 text-gray-600 text-lg">
            Experience personalized shopping with intelligent
            recommendations powered by ShopSphere AI.
          </p>

          <Link
            href="#products"
            className="inline-block mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition"
          >
            Explore Products
          </Link>
        </div>
      </section>

      <div id="products" className="scroll-mt-20">
        <ProductSection />
      </div>
    </main>
  );
}
