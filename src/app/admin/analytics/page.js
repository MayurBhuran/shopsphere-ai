
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { getRecommendationAnalytics } from "@/services/recommendationAnalytics";

const STRATEGIES = [
  "Recently Viewed",
  "Similar Products",
  "Category-Based",
  "Price-Based",
  "Wishlist-Based",
  "Cart-Based",
  "Frequently Bought Together",
  "Trending Products",
  "Personalized For You",
];

export default function RecommendationAnalyticsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = () => {
    setEvents(getRecommendationAnalytics());
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const impressions = events.filter(
    (event) => event.type === "impression"
  ).length;

  const clicks = events.filter(
    (event) => event.type === "click"
  ).length;

  const conversions = events.filter(
    (event) => event.type === "conversion"
  ).length;

  const clickRate =
    impressions > 0 ? (clicks / impressions) * 100 : 0;

  const conversionRate =
    clicks > 0 ? (conversions / clicks) * 100 : 0;

  const strategyStats = useMemo(() => {
    return STRATEGIES.map((strategy) => {
      const strategyEvents = events.filter(
        (event) => event.strategy === strategy
      );

      const strategyImpressions = strategyEvents.filter(
        (event) => event.type === "impression"
      ).length;

      const strategyClicks = strategyEvents.filter(
        (event) => event.type === "click"
      ).length;

      const strategyConversions = strategyEvents.filter(
        (event) => event.type === "conversion"
      ).length;

      return {
        name: strategy,
        impressions: strategyImpressions,
        clicks: strategyClicks,
        conversions: strategyConversions,
        ctr:
          strategyImpressions > 0
            ? (strategyClicks / strategyImpressions) * 100
            : 0,
      };
    });
  }, [events]);

  const maxClicks = Math.max(
    1,
    ...strategyStats.map((item) => item.clicks)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Recommendation Analytics
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor recommendation engagement and performance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                Local Analytics
              </span>

              <button
                onClick={loadAnalytics}
                className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[
            {
              title: "Recommendation Impressions",
              value: impressions,
              icon: Eye,
              color: "text-blue-600",
            },
            {
              title: "Recommendation Clicks",
              value: clicks,
              icon: MousePointerClick,
              color: "text-indigo-600",
            },
            {
              title: "Add-to-Cart Conversions",
              value: conversions,
              icon: ShoppingCart,
              color: "text-green-600",
            },
            {
              title: "Click-through Rate",
              value: `${clickRate.toFixed(1)}%`,
              icon: TrendingUp,
              color: "text-purple-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <Icon size={21} className={item.color} />
                </div>

                <h2 className={`mt-3 text-2xl font-bold ${item.color}`}>
                  {item.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* Conversion Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Click-to-Conversion Rate
            </p>
            <h2 className="mt-2 text-2xl font-bold text-green-600">
              {conversionRate.toFixed(1)}%
            </h2>
            <p className="mt-2 text-xs text-gray-400">
              Conversions divided by recommendation clicks.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Tracked Events
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {events.length}
            </h2>
            <p className="mt-2 text-xs text-gray-400">
              Impressions, clicks and conversions stored locally.
            </p>
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={19} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">
                Strategy Performance
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Engagement breakdown across all nine recommendation strategies.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-4">Strategy</th>
                  <th className="px-5 py-4">Impressions</th>
                  <th className="px-5 py-4">Clicks</th>
                  <th className="px-5 py-4">Conversions</th>
                  <th className="px-5 py-4">CTR</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {strategyStats.map((strategy) => (
                  <tr
                    key={strategy.name}
                    className="hover:bg-blue-50/30"
                  >
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {strategy.name}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {strategy.impressions}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {strategy.clicks}
                    </td>

                    <td className="px-5 py-4 font-medium text-green-600">
                      {strategy.conversions}
                    </td>

                    <td className="px-5 py-4">
                      {strategy.ctr.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Click Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">
            Clicks by Recommendation Strategy
          </h2>

          <div className="space-y-4">
            {strategyStats.map((strategy) => (
              <div key={strategy.name}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="text-gray-600">
                    {strategy.name}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {strategy.clicks}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${(strategy.clicks / maxClicks) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {events.length === 0 && (
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800">
            <strong>No analytics events yet.</strong>
            <p className="mt-1">
              Metrics will appear after recommendation impressions,
              clicks and add-to-cart conversions are connected to
              the storefront.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
