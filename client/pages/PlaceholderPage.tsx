import { useNavigate, useLocation } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://api.builder.io/api/v1/image/assets/TEMP/47962ef2428fa2a43c0475d09a205f58d64c2326?width=804')`
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <div className="mb-8 w-full max-w-md">
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
                {title}
              </h1>
            </div>
            <div className="w-10 h-10" />
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="max-w-md mx-auto text-center">
          <div className="glass-effect rounded-3xl p-8 glass-shadow">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-white text-xl font-medium mb-4">
              قريباً
            </h2>
            <p className="text-white/80 text-sm mb-6">
              هذه الصفحة قيد التطوير. سيتم إضافة المحتوى قريباً.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-medium transition-all duration-200"
            >
              العودة للقائمة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
