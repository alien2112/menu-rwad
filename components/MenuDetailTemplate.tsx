"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Plus } from "lucide-react";

interface MenuItem {
  id: number;
  title: string;
  price: string;
  image?: string;
  tags?: { label: string; color?: string }[];
}

interface MenuDetailTemplateProps {
  title: string;
  items: MenuItem[];
  backgroundImage?: string;
  pageRoute?: string; // e.g., '/natural-juices'
}

interface PageBackground {
  _id: string;
  pageRoute: string;
  pageName: string;
  backgroundImageId?: string;
  backgroundImageUrl?: string;
  status: 'active' | 'inactive';
}

export function MenuDetailTemplate({ title, items, backgroundImage, pageRoute }: MenuDetailTemplateProps) {
  const router = useRouter();
  const { dispatch } = useCart();
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pageRoute) {
      fetchPageBackground();
    } else {
      setLoading(false);
    }
  }, [pageRoute]);

  const fetchPageBackground = async () => {
    try {
      const response = await fetch('/api/page-backgrounds');
      const data = await response.json();
      
      if (data.success) {
        const background = data.data.find((bg: PageBackground) => 
          bg.pageRoute === pageRoute && bg.status === 'active'
        );
        setPageBackground(background || null);
      }
    } catch (error) {
      console.error('Error fetching page background:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundImage = () => {
    // Priority: pageBackground > prop backgroundImage > default
    if (pageBackground?.backgroundImageId) {
      return `/api/images/${pageBackground.backgroundImageId}`;
    }
    if (backgroundImage) {
      return backgroundImage;
    }
    return 'https://api.builder.io/api/v1/image/assets/TEMP/b13dcb7c2adff87cfd52fc29e7879f7f6059b2de?width=804';
  };

  const parsePrice = (priceString: string): number => {
    // Extract number from price string like "18 ر.س" or "18 ريال"
    const match = priceString.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const handleAddToCart = (item: MenuItem) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: item.id.toString(),
        name: item.title,
        price: parsePrice(item.price),
        image: item.image,
        category: title,
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-primary">
        <p className="text-white text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-90"
        style={{
          backgroundImage: `url('${getBackgroundImage()}')`
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="menu-item glass-shadow">
            <button
              onClick={() => router.push('/menu')}
              className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 text-white rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-white font-medium text-base leading-tight tracking-tight text-center">
                {title}
              </h1>
            </div>
            <div className="w-10 h-10" /> {/* Spacer for center alignment */}
          </div>
        </div>

        {/* Items Grid */}
        <div className="max-w-md mx-auto md:max-w-2xl">
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="menu-grid-item glass-shadow h-48 md:h-56 animate-in slide-in-from-bottom-4 duration-700 relative"
                     style={{
                       animationDelay: `${index * 100}ms`,
                       backgroundImage: item.image ? `url('${item.image}')` : undefined,
                       backgroundSize: 'cover',
                       backgroundPosition: 'center'
                     }}
              >
                <div className="h-full flex flex-col justify-end p-4">
                  <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                    <h3 className="text-white font-medium text-sm md:text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm mb-2">
                      {item.price}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white"
                            style={{
                              border: `1px solid ${tag.color || '#00BF89'}`,
                              boxShadow: `0 0 6px ${(tag.color || '#00BF89')}33`
                            }}
                            title={tag.label}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-coffee-green hover:bg-coffee-green/90 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 group relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-1">
                        <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="group-hover:scale-105 transition-transform duration-300">أضف للسلة</span>
                      </span>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom spacing for mobile */}
        <div className="h-8" />
      </div>
    </div>
  );
}
