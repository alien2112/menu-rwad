"use client";

import { useEffect, useState } from "react";
import { X, Star } from "lucide-react";

interface Review {
  _id: string;
  author_name: string;
  rating: number;
  text: string;
  createdAt: string;
}

interface ReviewModalProps {
  children: React.ReactNode;
}

export function ReviewModal({ children }: ReviewModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    author_name: "",
    rating: 5,
    text: "",
    email: "",
    phone: "",
  });
  const [message, setMessage] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'add-review'>('reviews');

  useEffect(() => {
    if (open) {
      const fetchReviews = async () => {
        try {
          const res = await fetch('/api/reviews');
          const data = await res.json();
          if (data.success) setReviews(data.data || []);
        } catch (e) {
          // noop
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.author_name,
          rating: form.rating,
          comment: form.text,
          email: form.email,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('تم إرسال المراجعة! سيتم نشرها بعد الموافقة.');
        setForm({ author_name: "", rating: 5, text: "", email: "", phone: "" });
        // Refresh reviews
        const reviewsRes = await fetch('/api/reviews');
        const reviewsData = await reviewsRes.json();
        if (reviewsData.success) setReviews(reviewsData.data || []);
      } else {
        setMessage(data.error || 'حدث خطأ أثناء الإرسال');
      }
    } catch (e) {
      setMessage('حدث خطأ أثناء الإرسال');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#4F3500] border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-white text-xl font-bold">آراء الزبائن وإضافة مراجعة</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-[#C2914A] text-white'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            المراجعات السابقة
          </button>
          <button
            onClick={() => setActiveTab('add-review')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'add-review'
                ? 'bg-[#C2914A] text-white'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            أضف مراجعتك
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'reviews' ? (
            <div className="space-y-4">
              {loadingReviews ? (
                <p className="text-white/80 text-sm text-center">جاري التحميل...</p>
              ) : reviews.length === 0 ? (
                <p className="text-white/80 text-sm text-center">لا توجد مراجعات بعد.</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white/10 rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold text-sm">
                        {review.author_name}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {review.text}
                    </p>
                    <p className="text-white/60 text-xs mt-2">
                      {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div className={`text-sm p-3 rounded-lg ${
                  message.includes('تم') ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                }`}>
                  {message}
                </div>
              )}

              <div>
                <label className="block text-white/80 text-sm mb-2">الاسم *</label>
                <input
                  value={form.author_name}
                  onChange={(e) => setForm((p) => ({ ...p, author_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#C2914A]"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">التقييم (1 - 5) *</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    rating: Math.max(1, Math.min(5, Number(e.target.value) || 5))
                  }))}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#C2914A]"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">مراجعتك *</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#C2914A]"
                  rows={4}
                  maxLength={500}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#C2914A]"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">الهاتف (اختياري)</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#C2914A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C2914A] hover:bg-[#B8853F] disabled:bg-[#C2914A]/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                {submitting ? '... جاري الإرسال' : 'إرسال المراجعة'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

