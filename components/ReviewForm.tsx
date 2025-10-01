"use client";

import { useState } from "react";
import { Star, Send, User, Mail, Phone, MessageSquare } from "lucide-react";

interface ReviewFormData {
  author_name: string;
  rating: number;
  text: string;
  email: string;
  phone: string;
}

export function ReviewForm() {
  const [formData, setFormData] = useState<ReviewFormData>({
    author_name: "",
    rating: 0,
    text: "",
    email: "",
    phone: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.author_name || !formData.rating || !formData.text) {
      setSubmitStatus({
        type: 'error',
        message: 'الاسم والتقييم والنص مطلوبة'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: 'تم إرسال المراجعة بنجاح! ستظهر بعد الموافقة عليها.'
        });
        setFormData({
          author_name: "",
          rating: 0,
          text: "",
          email: "",
          phone: ""
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'حدث خطأ في إرسال المراجعة'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'حدث خطأ في الاتصال'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-notification rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-white" />
        <h3 className="text-white text-xl font-bold">أضف مراجعتك</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="relative">
          <User className="absolute right-3 top-3 w-5 h-5 text-white/60" />
          <input
            type="text"
            name="author_name"
            value={formData.author_name}
            onChange={handleInputChange}
            placeholder="اسمك"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/60 focus:outline-none focus:border-coffee-gold transition-colors"
            required
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-white text-sm mb-2">تقييمك</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="transition-colors"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= formData.rating
                      ? "text-yellow-400 fill-current"
                      : "text-white/40"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            placeholder="اكتب مراجعتك هنا..."
            rows={4}
            maxLength={500}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-coffee-gold transition-colors resize-none"
            required
          />
          <p className="text-white/60 text-xs mt-1 text-left">
            {formData.text.length}/500
          </p>
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute right-3 top-3 w-5 h-5 text-white/60" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="البريد الإلكتروني (اختياري)"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/60 focus:outline-none focus:border-coffee-gold transition-colors"
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <Phone className="absolute right-3 top-3 w-5 h-5 text-white/60" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="رقم الهاتف (اختياري)"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/60 focus:outline-none focus:border-coffee-gold transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.author_name || !formData.rating || !formData.text}
          className="w-full bg-coffee-gold hover:bg-coffee-gold/90 disabled:bg-white/20 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              إرسال المراجعة
            </>
          )}
        </button>

        {/* Status Message */}
        {submitStatus.type && (
          <div className={`p-3 rounded-xl text-center ${
            submitStatus.type === 'success' 
              ? 'bg-green-500/20 text-green-300' 
              : 'bg-red-500/20 text-red-300'
          }`}>
            {submitStatus.message}
          </div>
        )}
      </form>
    </div>
  );
}

