"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Star, User, Mail, Phone, Calendar, MessageSquare, Package } from "lucide-react";
import Link from "next/link";

interface Review {
  _id: string;
  author_name: string;
  rating: number;
  text: string;
  email?: string;
  phone?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
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

  const updateReviewStatus = async (reviewId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReviews(reviews.map(review => 
          review._id === reviewId 
            ? { ...review, isApproved } 
            : review
        ));
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المراجعة؟')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setReviews(reviews.filter(review => review._id !== reviewId));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.isApproved;
    if (filter === 'approved') return review.isApproved;
    return true;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
          <MessageSquare className="w-8 h-8" />
          إدارة مراجعات المقهى
        </h2>

        <div className="flex gap-3 flex-wrap">
          {/* Link to Menu Item Reviews */}
          <Link href="/admin/menu-item-reviews">
            <button className="px-4 py-2 bg-coffee-gold/20 hover:bg-coffee-gold/30 text-coffee-gold rounded-lg transition-colors flex items-center gap-2">
              <Package className="w-5 h-5" />
              مراجعات المنتجات
            </button>
          </Link>

          {/* Filter Buttons */}
          <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-coffee-gold text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            الكل ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending' 
                ? 'bg-coffee-gold text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            في الانتظار ({reviews.filter(r => !r.isApproved).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'approved'
                ? 'bg-coffee-gold text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            معتمدة ({reviews.filter(r => r.isApproved).length})
          </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="glass-notification rounded-3xl p-8 text-center">
            <MessageSquare className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">لا توجد مراجعات</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review._id} className="glass-notification rounded-3xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-coffee-gold to-coffee-primary rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{review.author_name}</h3>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-white/60 text-sm">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!review.isApproved ? (
                    <button
                      onClick={() => updateReviewStatus(review._id, true)}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      اعتماد
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReviewStatus(review._id, false)}
                      className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      إلغاء الاعتماد
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded-lg transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <p className="text-white/90 text-base leading-relaxed mb-4">
                "{review.text}"
              </p>

              {/* Contact Info */}
              {(review.email || review.phone) && (
                <div className="flex gap-4 text-sm text-white/60">
                  {review.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{review.email}</span>
                    </div>
                  )}
                  {review.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{review.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
















