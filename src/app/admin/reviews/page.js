
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Star,
  MessageSquare,
  Trash2,
  Eye,
  X,
  ThumbsUp,
} from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [selectedReview, setSelectedReview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedReviews = JSON.parse(
        localStorage.getItem("shopsphere-reviews") || "[]"
      );

      setReviews(Array.isArray(savedReviews) ? savedReviews : []);
    } catch (error) {
      console.error("Unable to load reviews:", error);
      setMessage("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveReviews = (updatedReviews) => {
    try {
      localStorage.setItem(
        "shopsphere-reviews",
        JSON.stringify(updatedReviews)
      );

      setReviews(updatedReviews);
      setSelectedReview(null);
      setMessage("Review moderated successfully.");
    } catch (error) {
      console.error("Unable to save reviews:", error);
      setMessage("Unable to save changes.");
    }
  };

  // Support both new and older reviewer property names.
  const getReviewerName = (review) =>
    review.reviewerName || review.reviewer || "Anonymous";

const filteredReviews = useMemo(() => {
  const sortedReviews = [...reviews].sort((a, b) => {
    return (
      new Date(b.date || 0).getTime() -
      new Date(a.date || 0).getTime()
    );
  });

  return sortedReviews.filter((review) => {
    const reviewer =
      review.reviewerName || review.reviewer || "Anonymous";

    const title = review.title || "";
    const comment = review.comment || "";
    const product = review.productTitle || `Product #${review.productId || ""}`;

    const matchesSearch = [
      reviewer,
      title,
      comment,
      product,
    ].some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );

    const matchesRating =
      ratingFilter === "All" ||
      Number(review.rating) === Number(ratingFilter);

    return matchesSearch && matchesRating;
  });
}, [reviews, search, ratingFilter]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0
        ) / reviews.length
      : 0;

  const getRatingCount = (rating) =>
    reviews.filter(
      (review) => Number(review.rating) === rating
    ).length;

  const deleteReview = (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this review? This action cannot be undone."
    );

    if (!confirmed) return;

    const updatedReviews = reviews.filter(
      (review) => review.id !== reviewId
    );

    saveReviews(updatedReviews);
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          fill={star <= Number(rating) ? "#F59E0B" : "none"}
          color={star <= Number(rating) ? "#F59E0B" : "#CBD5E1"}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        Loading reviews...
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
                Reviews Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor customer feedback and moderate submitted reviews.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
              Local / Simulated Admin Actions
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Reviews</p>
              <MessageSquare size={21} className="text-blue-600" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {reviews.length}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Average Rating</p>
              <Star size={21} className="text-amber-500" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </h2>
              {renderStars(Math.round(averageRating))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Five Star Reviews</p>
              <ThumbsUp size={21} className="text-green-600" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-green-600">
              {getRatingCount(5)}
            </h2>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">
            Rating Distribution
          </h2>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = getRatingCount(rating);
              const percentage =
                reviews.length > 0
                  ? (count / reviews.length) * 100
                  : 0;

              return (
                <div
                  key={rating}
                  className="flex items-center gap-3"
                >
                  <div className="flex w-12 items-center gap-1 text-sm text-gray-600">
                    {rating} <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  </div>

                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-xs text-gray-500">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search product, reviewer or review..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Stars
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch("");
              setRatingFilter("All");
            }}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
            <button
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900">
              All Reviews ({filteredReviews.length})
            </h2>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare
                size={40}
                className="mx-auto mb-3 text-gray-300"
              />
              <h3 className="font-semibold text-gray-700">
                No reviews found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Customer reviews will appear here after submission.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredReviews.map((review, index) => (
                <div
                  key={review.id ?? `${review.productId}-${index}`}
                  className="flex flex-col justify-between gap-4 p-5 transition hover:bg-blue-50/30 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {getReviewerName(review)}
                      </h3>
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-sm font-medium text-gray-700">
                      {review.title || "Customer Review"}
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {review.comment || "No review text provided."}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      Product ID: {review.productId ?? "N/A"}
                      {" · "}
                      {review.date
                        ? new Date(review.date).toLocaleDateString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"
                    >
                      <Eye size={15} />
                      View
                    </button>

                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={review.id == null}
                      title="Remove review"
                      className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Details Modal */}
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Review Details
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Customer feedback
                  </p>
                </div>

                <button
                  onClick={() => setSelectedReview(null)}
                  className="rounded-full p-2 hover:bg-gray-100"
                  aria-label="Close review details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="rounded-xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">Reviewer</p>
                <h3 className="mt-1 font-semibold text-gray-900">
                  {getReviewerName(selectedReview)}
                </h3>

                <div className="mt-4">
                  {renderStars(selectedReview.rating)}
                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  {selectedReview.title || "Customer Review"}
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {selectedReview.comment || "No review text provided."}
                </p>

                <div className="mt-5 border-t pt-4 text-xs text-gray-500">
                  <p>Product ID: {selectedReview.productId ?? "N/A"}</p>
                  <p className="mt-1">
                    Submitted:{" "}
                    {selectedReview.date
                      ? new Date(selectedReview.date).toLocaleString()
                      : "Date unavailable"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                className="mt-5 w-full rounded-lg border py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
