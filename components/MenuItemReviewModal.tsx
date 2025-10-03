"use client";

import { useState, useEffect } from "react";
import { X, Star, Send } from "lucide-react";

interface Review {
  _id: string;
  author_name: string;
  rating: number;
  text: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

interface MenuItemReviewModalProps {
  menuItemId: string;
  menuItemName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MenuItemReviewModal({
  menuItemId,
  menuItemName,
  isOpen,
  onClose,
}: MenuItemReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'submit'>('view');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    author_name: '',
    rating: 5,
    text: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, menuItemId]);

  // Auto-collapse textarea after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (formData.text && isTextareaExpanded) {
      timeout = setTimeout(() => {
        setIsTextareaExpanded(false);
      }, 3000); // Collapse after 3 seconds of inactivity
    }

    return () => clearTimeout(timeout);
  }, [formData.text, isTextareaExpanded]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/menu-items/${menuItemId}/reviews`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const response = await fetch(`/api/menu-items/${menuItemId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFormData({
          author_name: '',
          rating: 5,
          text: '',
          email: '',
          phone: ''
        });

        // Show success message
        alert('تم إرسال المراجعة بنجاح! سيتم عرضها بعد الموافقة عليها.');

        // Switch to view tab
        setActiveTab('view');
      } else {
        alert('حدث خطأ أثناء إرسال المراجعة');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('حدث خطأ أثناء إرسال المراجعة');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${interactive ? 'cursor-pointer' : ''} ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
        onClick={() => interactive && setFormData({ ...formData, rating: i + 1 })}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        className="bg-card border border-card-border rounded-2xl w-full max-w-4xl my-8 flex flex-col"
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#c59a6c] to-[#a67c52] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-2">{menuItemName}</h2>
          <p className="text-white/90">التقييمات والمراجعات</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'view'
                ? 'bg-[#c59a6c] text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            عرض التقييمات ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'submit'
                ? 'bg-[#c59a6c] text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            إضافة تقييم
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'view' ? (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c59a6c]"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">لا توجد تقييمات حتى الآن</p>
                  <p className="text-muted-foreground text-sm mt-2">كن أول من يقيم هذا المنتج!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-muted/50 rounded-xl p-4 border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-foreground">{review.author_name}</h3>
                        <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  الاسم *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-[#c59a6c]"
                  placeholder="أدخل اسمك"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  التقييم *
                </label>
                <div className="flex gap-1">
                  {renderStars(formData.rating, true)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  المراجعة *
                </label>
                <div className="relative">
                  <textarea
                    required
                    value={formData.text}
                    onChange={(e) => {
                      setFormData({ ...formData, text: e.target.value });
                      setIsTextareaExpanded(true);
                    }}
                    onFocus={() => setIsTextareaExpanded(true)}
                    className={`w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-[#c59a6c] transition-all duration-300 ease-in-out ${
                      isTextareaExpanded ? 'min-h-32' : 'min-h-12'
                    }`}
                    placeholder="شاركنا رأيك في المنتج..."
                    maxLength={500}
                  />
                  {!isTextareaExpanded && formData.text && (
                    <button
                      type="button"
                      onClick={() => setIsTextareaExpanded(true)}
                      className="absolute inset-0 flex items-center px-4 text-sm text-muted-foreground cursor-pointer"
                    >
                      <span className="truncate">{formData.text}</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{formData.text.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-[#c59a6c]"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:border-[#c59a6c]"
                  placeholder="+966 XXX XXX XXX"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-[#c59a6c] text-white rounded-xl font-semibold hover:bg-[#a67c52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    إرسال التقييم
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
