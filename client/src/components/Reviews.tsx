import React, { useEffect, useState } from "react";
import { createReview, createReviewWithPhotos, getReviews, type Review } from "../services/reviewService";
import { useAuth } from "../context/AuthContext";

const Reviews: React.FC<{ villaId: number }> = ({ villaId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    getReviews(villaId).then(setReviews);
  }, [villaId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to review");
      return;
    }
    let r: Review;
    if (images.length > 0) {
      r = await createReviewWithPhotos(villaId, { rating, comment, authorEmail: user.email, images });
    } else {
      r = await createReview(villaId, { rating, comment, authorEmail: user.email });
    }
    setReviews((prev) => [r, ...prev]);
    setRating(5);
    setComment("");
    setImages([]);
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
          <div>
            <label className="block text-sm font-medium mb-1">Add photos (optional):</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => setImages(e.target.files ? Array.from(e.target.files) : [])}
              className="block w-full text-sm border rounded-md px-2 py-1"
            />
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((img, i) => (
                  <span key={i} className="inline-block bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded text-xs">{img.name}</span>
                ))}
              </div>
            )}
          </div>
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
            {r.photoUrls && r.photoUrls.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {r.photoUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="review"
                    className="w-20 h-20 object-cover rounded cursor-pointer hover:scale-105 transition"
                    onClick={() => setLightboxUrl(url)}
                  />
                ))}
              </div>
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
    {/* Lightbox modal for enlarged review photo */}
    {lightboxUrl && (
      <div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        onClick={() => setLightboxUrl(null)}
      >
        <div className="relative" onClick={e => e.stopPropagation()}>
          <img src={lightboxUrl} alt="review large" className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg" />
          <button
            className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full px-3 py-1 text-black font-bold text-lg"
            onClick={() => setLightboxUrl(null)}
          >
            ×
          </button>
        </div>
      </div>
    )}
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
