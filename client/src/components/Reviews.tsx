import React, { useEffect, useState } from "react";
import { createReview, getReviews, type Review } from "../services/reviewService";
import { useAuth } from "../context/AuthContext";

const Reviews: React.FC<{ villaId: number }> = ({ villaId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    getReviews(villaId).then(setReviews);
  }, [villaId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to review");
      return;
    }
    const r = await createReview(villaId, { rating, comment, authorEmail: user.email });
    setReviews((prev) => [r, ...prev]);
    setRating(5);
    setComment("");
    alert("Review submitted. Thank you!");
  };

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-md rounded-xl p-6">
      {/* Header Summary */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-semibold">Guest Reviews</h3>
        <AverageSummary reviews={reviews} />
      </div>

      {/* Breakdown Summary */}
      <BreakdownSummary reviews={reviews} />

      {/* Review Form */}
      {user && (
        <form
          onSubmit={submit}
          className="mb-6 bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg space-y-3"
        >
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Your Rating:</label>
            <select
              className="border rounded-md px-2 py-1"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}★
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm resize-none"
            rows={3}
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="bg-accent-600 hover:bg-accent-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Post Review
          </button>
        </form>
      )}

      {/* Review List */}
      <ul className="space-y-4">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="border-b border-neutral-200 dark:border-neutral-700 pb-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600 text-white font-semibold px-2 py-1 rounded-md text-sm">
                {r.rating}★
              </span>
              <span className="text-sm text-gray-600">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
            {r.comment && (
              <p className="text-sm text-gray-700 dark:text-neutral-300">{r.comment}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              by {r.authorEmail || "Anonymous"}
            </p>
          </li>
        ))}
        {reviews.length === 0 && (
          <div className="text-sm text-gray-500">No reviews yet. Be the first!</div>
        )}
      </ul>
    </div>
  );
};

export default Reviews;

/* Average summary (badge + count) */
const AverageSummary: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  if (reviews.length === 0)
    return <span className="text-sm text-neutral-500">No reviews</span>;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="flex items-center gap-2">
      <span className="bg-blue-600 text-white font-bold px-3 py-2 rounded-lg text-lg">
        {avg.toFixed(1)}
      </span>
      <span className="text-sm text-gray-700 dark:text-neutral-300">
        {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
};

/* Breakdown summary (5★ → 1★ bars) */
const BreakdownSummary: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  if (reviews.length === 0) return null;

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => (counts[r.rating] = (counts[r.rating] || 0) + 1));

  return (
    <div className="mb-6">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = counts[star];
        const percent = Math.round((count / reviews.length) * 100);
        return (
          <div key={star} className="flex items-center gap-3 mb-1">
            <span className="w-6 text-sm">{star}★</span>
            <div className="flex-1 bg-gray-200 dark:bg-neutral-700 rounded h-2">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-10 text-sm text-gray-600">{count}</span>
          </div>
        );
      })}
    </div>
  );
};
