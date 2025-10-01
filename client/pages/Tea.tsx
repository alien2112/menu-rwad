import { useNavigate } from "react-router-dom";

export default function Tea() {
  const navigate = useNavigate();

  const teaItems = [
    { id: 1, title: "شاي أحمر", price: "15 ر.س" },
    { id: 2, title: "شاي أخضر", price: "18 ر.س" },
    { id: 3, title: "شاي بالنعناع", price: "20 ر.س" },
    { id: 4, title: "شاي بالحليب", price: "22 ر.س" },
    { id: 5, title: "شاي تركي", price: "25 ر.س" },
    { id: 6, title: "شاي كشري", price: "20 ر.س" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{
          backgroundImage: `url('https://api.builder.io/api/v1/image/assets/TEMP/b13dcb7c2adff87cfd52fc29e7879f7f6059b2de?width=804')`
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
              onClick={() => navigate('/')}
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
                الشاي
              </h1>
            </div>
            <div className="w-10 h-10" /> {/* Spacer for center alignment */}
          </div>
        </div>

        {/* Tea Grid */}
        <div className="max-w-md mx-auto md:max-w-2xl">
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {teaItems.map((item, index) => (
              <div
                key={item.id}
                className="menu-grid-item glass-shadow h-48 md:h-56 animate-in slide-in-from-bottom-4 duration-700"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="h-full flex flex-col justify-end p-4">
                  <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                    <h3 className="text-white font-medium text-sm md:text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm">
                      {item.price}
                    </p>
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
