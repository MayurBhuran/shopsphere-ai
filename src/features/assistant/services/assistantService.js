
import { getProducts, searchProducts, } from "@/services/productService";
import { parseShoppingIntent } from "./intentParser";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function getProductText(product) {
  return [
    product.title,
    product.description,
    product.category,
    product.brand,
    ...(product.tags || []),
  ]
    .join(" ")
    .toLowerCase();
}

function getAvailableProducts(products) {
  return products.filter((product) => Number(product.stock) > 0);
}

function filterProducts(products, intent) {
  let results = getAvailableProducts(products);

 if (intent.category === "smartphones") {
  results = results.filter((product) => {
    const text = getProductText(product);

    return (
      text.includes("phone") ||
      text.includes("smartphone") ||
      text.includes("mobile")
    );
  });
} else if (intent.category) {
  const categoryAliases = {
    laptops: ["laptops"],
    beauty: ["beauty"],
    fragrances: ["fragrances"],
  };

  const acceptedCategories =
    categoryAliases[intent.category] || [intent.category];

  results = results.filter((product) =>
    acceptedCategories.includes(normalize(product.category))
  );
}

  if (intent.maxPrice !== null) {
    results = results.filter(
      (product) => Number(product.price) <= intent.maxPrice
    );
  }

  if (intent.minRating !== null) {
    results = results.filter(
      (product) => Number(product.rating) >= intent.minRating
    );
  }

  if (intent.brand) {
    results = results.filter(
      (product) => normalize(product.brand).includes(normalize(intent.brand))
    );
  }

  if (intent.color) {
    results = results.filter((product) =>
      getProductText(product).includes(normalize(intent.color))
    );
  }

  return results.sort((a, b) => b.rating - a.rating);
}

function getSimilarProducts(products, previousProducts, referenceIndex) {
  const referenceProduct = previousProducts?.[referenceIndex];

  if (!referenceProduct) {
    return {
      products: [],
      message:
        "Please select a product first so I can find similar products for you.",
    };
  }

  const results = getAvailableProducts(products)
    .filter(
      (product) =>
        product.id !== referenceProduct.id &&
        normalize(product.category) === normalize(referenceProduct.category)
    )
    .sort((a, b) => b.rating - a.rating);

  return {
    products: results,
    message: `Here are some products similar to ${referenceProduct.title}.`,
  };
}

function getCheaperProducts(products, previousProducts) {
  const referencePrice = previousProducts?.[0]?.price;

  if (!Number(referencePrice)) {
    return {
      products: [],
      message:
        "Please select a product first so I can find more affordable alternatives.",
    };
  }

  const results = getAvailableProducts(products)
    .filter((product) => Number(product.price) < Number(referencePrice))
    .sort((a, b) => a.price - b.price);

  return {
    products: results,
    message: `Here are some alternatives cheaper than your selected product ($${referencePrice}).`,
  };
}

function getExpensiveProducts(products, previousProducts) {
  const referencePrice = previousProducts?.[0]?.price;

  if (!Number(referencePrice)) {
    return {
      products: [],
      message:
        "Please select a product first so I can find more expensive alternatives.",
    };
  }

  const results = getAvailableProducts(products)
    .filter((product) => Number(product.price) > Number(referencePrice))
    .sort((a, b) => a.price - b.price);

  return {
    products: results,
    message: `Here are some higher-priced alternatives to your selected product.`,
  };
}

function getHigherRatedProducts(products, previousProducts) {
  const referenceRating = previousProducts?.[0]?.rating;

  const results = getAvailableProducts(products)
    .filter(
      (product) =>
        !referenceRating || Number(product.rating) > Number(referenceRating)
    )
    .sort((a, b) => b.rating - a.rating);

  return {
    products: results,
    message: referenceRating
      ? `Here are products rated higher than your selected product (${referenceRating} stars).`
      : "Here are some of our highest-rated available products.",
  };
}

export async function getAssistantResponse(
  userMessage,
  previousProducts = []
) {
  try {
    const intent = parseShoppingIntent(userMessage);

    if (intent.type === "greeting" || intent.type === "help") {
      return {
        success: true,
        message: intent.message,
        products: [],
        intent,
        appliedFilters: [],
      };
    }

    if (intent.type === "fallback") {
      return {
        success: true,
        message: intent.message,
        products: [],
        intent,
        appliedFilters: [],
      };
    }
const allProducts =
  intent.type === "product_search" &&
  intent.category === "smartphones"
    ? await searchProducts("phone")
    : await getProducts();
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      return {
        success: false,
        message: "I couldn't load products right now. Please try again.",
        products: [],
        intent,
        appliedFilters: [],
      };
    }

    let result;

    switch (intent.type) {
      case "product_search": {
        const filtered = filterProducts(allProducts, intent);

        const appliedFilters = [];

        if (intent.category) {
          appliedFilters.push(`Category: ${intent.category}`);
        }

        if (intent.maxPrice !== null) {
          appliedFilters.push(`Maximum price: $${intent.maxPrice}`);
        }

        if (intent.minRating !== null) {
          appliedFilters.push(`Minimum rating: ${intent.minRating} stars`);
        }

        if (intent.brand) {
          appliedFilters.push(`Brand: ${intent.brand}`);
        }

        if (intent.color) {
          appliedFilters.push(`Color: ${intent.color}`);
        }

        result = {
          products: filtered.slice(0, 8),
          appliedFilters,
          message: filtered.length
            ? `I found ${filtered.length} products matching your request. Here are the best matches.`
            : "I couldn't find products matching all those filters. Try changing your budget, category or rating.",
        };

        break;
      }

      case "similar_products": {
        result = getSimilarProducts(
          allProducts,
          previousProducts,
          intent.referenceIndex
        );

        result.products = result.products.slice(0, 8);
        result.appliedFilters = ["Similar category"];
        break;
      }

      case "price_comparison": {
        result =
          intent.direction === "cheaper"
            ? getCheaperProducts(allProducts, previousProducts)
            : getExpensiveProducts(allProducts, previousProducts);

        result.products = result.products.slice(0, 8);
        result.appliedFilters = [
          intent.direction === "cheaper"
            ? "Lower price"
            : "Higher price",
        ];
        break;
      }

      case "rating_comparison": {
        result = getHigherRatedProducts(allProducts, previousProducts);
        result.products = result.products.slice(0, 8);
        result.appliedFilters = ["Higher customer rating"];
        break;
      }

      default:
        result = {
          products: [],
          message:
            "I'm not sure what you're looking for. Could you tell me the product category or your budget?",
          appliedFilters: [],
        };
    }

    return {
      success: true,
      message:
        result.products.length > 0
          ? result.message
          : result.message ||
            "No matching products were found. Could you try a different search?",
      products: result.products,
      intent,
      appliedFilters: result.appliedFilters || [],
    };
  } catch (error) {
    console.error("Shopping assistant error:", error);

    return {
      success: false,
      message:
        "Sorry, something went wrong while finding products. Please try again.",
      products: [],
      intent: null,
      appliedFilters: [],
    };
  }
}
