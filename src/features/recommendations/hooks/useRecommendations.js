
"use client";

import { useCallback, useEffect, useState } from "react";
import { getCustomerSignals } from "../services/signalService";
import { getRecommendations } from "../services/recommendationProvider";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";

export default function useRecommendations({
  products = [],
  strategy,
  limit = 8,
  referenceProduct = null,
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [signals, setSignals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshRecommendations = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const customerSignals = getCustomerSignals();

      const results = getRecommendations({
        strategy,
        products,
        signals: customerSignals,
        limit,
        referenceProduct,
      });

      setSignals(customerSignals);
      setRecommendations(results);
    } catch (err) {
      console.error("Recommendation error:", err);
      setError("Unable to load recommendations.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [products, strategy, limit, referenceProduct]);

  // Initial load and refresh when hook inputs change
  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  // Automatically refresh when cart or wishlist changes
  useEffect(() => {
    const unsubscribeCart = useCartStore.subscribe(
      (state, previousState) => {
        if (state.cart !== previousState.cart) {
          refreshRecommendations();
        }
      }
    );

    const unsubscribeWishlist = useWishlistStore.subscribe(
      (state, previousState) => {
        if (state.wishlist !== previousState.wishlist) {
          refreshRecommendations();
        }
      }
    );

    return () => {
      unsubscribeCart();
      unsubscribeWishlist();
    };
  }, [refreshRecommendations]);

  // Listen for preference and other signal updates
  useEffect(() => {
    const handleSignalUpdate = () => {
      refreshRecommendations();
    };

    const handleStorageChange = (event) => {
      const relevantKeys = [
        "shopsphere-recommendation-preferences",
        "shopsphere-recently-viewed",
        "shopsphere-recent-searches",
        "shopsphere-cart",
        "shopsphere-wishlist",
      ];

      if (relevantKeys.includes(event.key)) {
        refreshRecommendations();
      }
    };

    window.addEventListener(
      "shopsphere-signals-updated",
      handleSignalUpdate
    );

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "shopsphere-signals-updated",
        handleSignalUpdate
      );

      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshRecommendations]);

  return {
    recommendations,
    signals,
    loading,
    error,
    refreshRecommendations,
  };
}
