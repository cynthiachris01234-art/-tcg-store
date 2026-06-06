'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquare, Send, X } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  product?: string;
  created_at: string;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${s} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-white font-semibold text-sm">{review.name}</p>
          {review.product && (
            <p className="text-muted text-xs mt-0.5">Bought: {review.product}</p>
          )}
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">"{review.review}"</p>
      <p className="text-muted text-xs">
        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
}

function ReviewForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [form, setForm]     = useState({ name: '', rating: 5, review: '', product: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setDone(true);
      setTimeout(() => { onSubmit(); onClose(); }, 2000);
    } catch {}
    setLoading(false);
  }

  if (done) return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">🎉</div>
      <p className="text-white font-semibold">Thank you for your review!</p>
      <p className="text-muted text-sm mt-1">Your review has been submitted.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-lg">Leave a Review</h3>
        <button type="button" onClick={onClose} className="text-muted hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="text-muted text-xs block mb-1">Your Name</label>
        <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
          placeholder="John S."
          className="w-full bg-bg border border-bg-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent" />
      </div>

      <div>
        <label className="text-muted text-xs block mb-1">Rating</label>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => (
            <button key={i} type="button" onClick={() => setForm(f => ({...f, rating: i}))}>
              <Star className={`w-7 h-7 transition-colors ${i <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-300'}`} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-muted text-xs block mb-1">Product (optional)</label>
        <input value={form.product} onChange={e => setForm(f => ({...f, product: e.target.value}))}
          placeholder="e.g. Pokémon Evolving Skies ETB"
          className="w-full bg-bg border border-bg-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent" />
      </div>

      <div>
        <label className="text-muted text-xs block mb-1">Your Review</label>
        <textarea required rows={3} value={form.review} onChange={e => setForm(f => ({...f, review: e.target.value}))}
          placeholder="Share your experience..."
          className="w-full bg-bg border border-bg-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent resize-none" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3">
        <Send className="w-4 h-4" />
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function loadReviews() {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {}
  }

  useEffect(() => { loadReviews(); }, []);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-white">Customer Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={5} size="lg" />
            <span className="text-2xl font-bold text-accent">{avg}</span>
            <span className="text-muted text-sm">/ 5.0 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Review form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <ReviewForm onClose={() => setShowForm(false)} onSubmit={loadReviews} />
          </div>
        </div>
      )}

      {/* Reviews grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
      </div>
    </section>
  );
}
