import React, { useEffect, useState } from 'react';
import { createReview, getReviews, type Review } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';

const Reviews: React.FC<{ villaId: number }> = ({ villaId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => { getReviews(villaId).then(setReviews); }, [villaId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert('Please sign in to review'); return; }
    const r = await createReview(villaId, { rating, comment, authorEmail: user.email });
    setReviews(prev => [r, ...prev]); setRating(5); setComment('');
    alert('Review submitted. Thank you!');
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <AverageSummary reviews={reviews} />
      </div>
      {user && (
        <form onSubmit={submit} className="flex gap-2 mb-4">
          <select className="input w-28" value={rating} onChange={e=>setRating(parseInt(e.target.value))}>
            {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}★</option>)}
          </select>
          <input className="input flex-1" placeholder="Write a comment (optional)" value={comment} onChange={e=>setComment(e.target.value)} />
          <button className="bg-accent-600 text-white px-3 py-2 rounded">Post</button>
        </form>
      )}
      <ul className="space-y-3">
        {reviews.map(r => (
          <li key={r.id} className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="text-sm">{r.rating}★ • {new Date(r.createdAt).toLocaleDateString()}</div>
            {r.comment && <div className="text-neutral-700 dark:text-neutral-300 text-sm">{r.comment}</div>}
          </li>
        ))}
        {reviews.length === 0 && <div className="text-sm text-neutral-500">No reviews yet.</div>}
      </ul>
    </div>
  );
};

export default Reviews;

const AverageSummary: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  if (reviews.length === 0) return <span className="text-sm text-neutral-500">No reviews</span>;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return <span className="text-sm">{avg.toFixed(1)}★ · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>;
}


