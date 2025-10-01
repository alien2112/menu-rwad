import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    id: "offers",
    title: "العروض",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/24894209132cff55cd4cfb4dabe8b570960c19bc?width=68",
    iconAlt: "هدية",
    route: "/offers"
  },
  {
    id: "tea",
    title: "الشاي",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/f342ec3b49d01d7e9eb71093eec45dae50e1c06b?width=72",
    iconAlt: "فنجان شاي",
    route: "/tea"
  },
  {
    id: "cold-coffee",
    title: "قهوة بارده",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/32aef080205f82b8f4b103c0cd979308b95d2d19?width=68",
    iconAlt: "ثلج",
    route: "/cold-coffee"
  },
  {
    id: "hot-coffee",
    title: "قهوه ساخنة",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/6e4972442f216b34607ffaa20412dd755012a4d2?width=60",
    iconAlt: "نار",
    route: "/hot-coffee"
  },
  {
    id: "natural-juices",
    title: "العصائر الطبيعية",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/0061650c9228a74090b6905e5a3c5f396dea26b6?width=54",
    iconAlt: "عصير استوائي",
    route: "/natural-juices"
  },
  {
    id: "cocktails",
    title: "الكوكتيل و الموهيتو",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/c5fe8d5173faa0d9b636382c2f32a34375dae1d1?width=66",
    iconAlt: "مشروب كوكتيل",
    route: "/cocktails"
  },
  {
    id: "manakish",
    title: "المناقيش و الفطائر",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/621674a75978c3bcd6e88400c0dc63fefc51776d?width=52",
    iconAlt: "فطائر",
    route: "/manakish"
  },
  {
    id: "pizza",
    title: "البيتزا",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/b68ed657334a268ff8c023e2831ae25d0988520a?width=54",
    iconAlt: "شريحة بيتزا",
    route: "/pizza"
  },
  {
    id: "sandwiches",
    title: "السندوتش و البرجر",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/25389b4fee72a8c437f2dfee9b468b47da34a3cc?width=64",
    iconAlt: "ساندوتش",
    route: "/sandwiches"
  },
  {
    id: "desserts",
    title: "الحلا",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/f400aa2409f2a47ba2ba36ea8fe85c63e55cfd1c?width=52",
    iconAlt: "حلوى",
    route: "/desserts"
  },
  {
    id: "shisha",
    title: "الشيشة",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/9b45510037581f790556bf8fdd013550346c228b?width=72",
    iconAlt: "دخان",
    route: "/shisha"
  }
];

export default function Index() {
  const navigate = useNavigate();

  const handleItemClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: `url('https://api.builder.io/api/v1/image/assets/TEMP/47962ef2428fa2a43c0475d09a205f58d64c2326?width=804')`
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-10 p-4">
        <div className="max-w-sm mx-auto">
          <div className="relative flex items-center justify-center rounded-[34px] px-8 py-4 bg-gradient-to-r from-[#2d3565]/80 via-[#252f60]/75 to-[#1d2755]/70 border border-white/15 shadow-[0_20px_76px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
            <div className="absolute inset-y-0 right-4 flex items-center">
              <svg
                className="w-10 h-10 text-white/90"
                viewBox="0 0 65 59"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M59.175 34.1489C57.8866 38.6421 55.4842 42.7369 52.1906 46.0536C48.897 49.3703 44.819 51.8012 40.335 53.121"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="absolute inset-y-0 left-4 flex items-center">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25" />
            </div>
            <span className="text-white text-base font-medium tracking-tight">
              القائمة
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="relative z-10 px-6 pb-8">
        <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                className="menu-item glass-shadow animate-in slide-in-from-bottom-4 duration-700"
                onClick={() => handleItemClick(item.route)}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
                  <img
                    src={item.iconSrc}
                    alt={item.iconAlt}
                    className="w-7 h-7 object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Title */}
                <div className="flex-1">
                  <h3 className="text-white font-medium text-base leading-tight tracking-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
