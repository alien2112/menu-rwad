import { useState } from "react";
import { NotificationCard } from "@/components/NotificationCard";
import { Sidebar } from "@/components/Sidebar";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-primary relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="relative z-10 mobile-container bg-coffee-primary coffee-shadow min-h-screen">
        
        {/* Header with Brand */}
        <div className="relative px-6 pt-8 pb-4">
          {/* Hamburger Menu */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="absolute top-8 left-6 z-20"
          >
            <div className="w-4 h-4 flex flex-col justify-between">
              <div className="w-full h-0 border-t border-white"></div>
              <div className="w-full h-0 border-t border-white"></div>
              <div className="w-full h-0 border-t border-white"></div>
            </div>
          </button>
          
          {/* Header Image */}
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/3a8a61eff81c146ce684b57f93d583ecefdbc023?width=220"
            alt="موال مراكش"
            className="w-28 h-96 object-cover rounded-2xl mx-auto"
          />
          
          {/* Brand Logo */}
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/8c5f46c507d7f4eb1bab4ed3e8c8053a36dfe18a?width=228"
            alt="موال مراكش طواجن"
            className="w-28 h-20 object-contain absolute top-8 right-6"
          />
          
          {/* Brand Text */}
          <div className="text-center mt-4">
            <p className="text-white arabic-body text-xs text-shadow">
              تجربة قهوة استثنائية في قلب المدينة المنورة
            </p>
          </div>
        </div>

        {/* Browse Menu Button */}
        <div className="px-6 mb-6">
          <button className="glass-green-button rounded-3xl px-6 py-4 mx-auto block">
            <span className="text-white arabic-body text-base">تصفح المنيو</span>
          </button>
        </div>

        {/* Main Content Area with Notifications */}
        <div className="px-6 space-y-4 mb-6">
          
          {/* Large Content Card */}
          <div className="glass-notification rounded-3xl p-6 h-64 relative inset-shadow">
            <div className="flex justify-center items-center h-full space-x-8">
              {/* Icons */}
              <div className="text-4xl">⚡</div>
              <div className="text-4xl">💧</div>
              <div className="text-4xl">☕</div>
            </div>
          </div>

          {/* Notification Cards */}
          <NotificationCard className="h-20" />
          <NotificationCard className="h-20" />
          <NotificationCard className="h-20" />
        </div>

        {/* Detail Section with Colored Buttons */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="glass-effect rounded-full px-4 py-2">
              <span className="text-white text-sm">Detail</span>
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 rounded-full bg-pink-400"></div>
              <div className="w-8 h-8 rounded-full bg-blue-500"></div>
              <div className="w-8 h-8 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>

        {/* App Icons Grid */}
        <div className="px-6 mb-6">
          <div className="glass-notification rounded-3xl p-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-16 h-16 bg-white rounded-2xl"></div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl">🔥</div>
              <button className="glass-button rounded-full px-6 py-3">
                <span className="text-coffee-secondary text-sm">القائمة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Icons Section */}
        <div className="px-6 space-y-4 mb-6">
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center space-y-2">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/e4cdc1c2c15fdb65dab072edce78c1ba03353131?width=84" alt="Ice" className="w-10 h-12" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/b895e1990349d7a4d8c278839df6c56ded391f5d?width=128" alt="App Icon" className="w-16 h-16 rounded-2xl" />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10"></div>
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/b895e1990349d7a4d8c278839df6c56ded391f5d?width=128" alt="App Icon" className="w-16 h-16 rounded-2xl" />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10"></div>
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/b895e1990349d7a4d8c278839df6c56ded391f5d?width=128" alt="App Icon" className="w-16 h-16 rounded-2xl" />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/ce427cd874b2f86f1d8515b1ba4705504dfd2342?width=78" alt="Leaf" className="w-10 h-11" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/b895e1990349d7a4d8c278839df6c56ded391f5d?width=128" alt="App Icon" className="w-16 h-16 rounded-2xl" />
            </div>
          </div>
          
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center space-y-2">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/fd38b05ba12d27f6705438b758cfd032345ec201?width=86" alt="Fire" className="w-11 h-10" />
              <div className="w-16 h-16"></div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10"></div>
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/b895e1990349d7a4d8c278839df6c56ded391f5d?width=128" alt="App Icon" className="w-16 h-16 rounded-2xl" />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/3d98bdd25617302300221b8927fb20d141f93f63?width=100" alt="Tropical Drink" className="w-12 h-13" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/b895e1990349d7a4d8c278839df6c56ded391f5d?width=128" alt="App Icon" className="w-16 h-16 rounded-2xl" />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/e9dc8adcae8b83cf3261922e8dbd0bd45c45c7d4?width=78" alt="Glowing Star" className="w-10 h-11" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/b895e1990349d7a4d8c278839df6c56ded391f5d?width=128" alt="App Icon" className="w-16 h-16 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Our Signature Drinks Section */}
        <div className="px-6 py-8">
          <h2 className="text-white text-center text-2xl mb-6" style={{ fontFamily: 'Seymour One, serif' }}>
            Our Signature Drinks
          </h2>
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c5b090dabf461e69a43cc911b2d3bea8d31b3afd?width=708"
            alt="Signature Coffee"
            className="w-full h-56 object-cover rounded-3xl mb-8"
          />
        </div>

        {/* Special Offers Section */}
        <div className="px-6 mb-8">
          <h2 className="text-white text-center text-2xl mb-6" style={{ fontFamily: 'Seymour One, serif' }}>
            special OFFERS
          </h2>

          {/* First Offer - Large card with image */}
          <div className="glass-notification rounded-3xl p-0 h-52 mb-4 overflow-hidden">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/2c14d9efcd10594d749c1cd77e616212944ab61c?width=270"
              alt="Special Offer"
              className="w-32 h-48 object-cover rounded-2xl float-left mr-4 mt-2 ml-2"
            />
          </div>

          {/* Second Offer - Split layout */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/53d503bc15150f33ae53e7aa8e5539ca2d8fc2c0?width=270"
              alt="Coffee Offer"
              className="w-full h-48 object-cover rounded-2xl"
            />
            <div className="col-span-2 glass-notification rounded-3xl h-48"></div>
          </div>
        </div>

        {/* Scroll Edge Effect */}
        <div className="relative h-16 mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent opacity-90 backdrop-blur-lg"></div>
        </div>

        {/* Coffee Journey Content */}
        <div className="px-6 space-y-8">

          {/* Coffee Journey Section */}
          <div className="glass-notification rounded-3xl p-6 h-48">
            <div className="grid grid-cols-3 gap-4 h-full">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/dc683e9073ad8e633606aaff4134c59bbcdd30a3?width=242"
                alt="Coffee Beans"
                className="w-full h-36 object-cover rounded-3xl shadow-lg"
              />
              <div className="col-span-2 flex flex-col justify-center text-white text-xs leading-5">
                <h3 className="font-bold mb-2 text-sm">رحلتنا مع القهوة</h3>
                <p className="text-right">
                  من الحبة إلى الكوب، نصنع كل قهوة بشغف ودقة، لنقدم لك أرقى النكهات من جميع أنحاء العالم. بدأت رحلتنا بحلم بسيط: مشاركة الطعم الأصيل لثقافة القهوة المغربية.
                </p>
              </div>
            </div>
          </div>

          {/* Authentic Atmosphere Section */}
          <div className="glass-notification rounded-3xl p-6 h-48">
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="col-span-2 flex flex-col justify-center text-white text-xs leading-5">
                <h3 className="font-bold mb-2 text-sm text-right">أجواء أصيلة</h3>
                <p className="text-right">
                  ادخل إلى عالمنا حيث تلتقي الضيافة المغربية التقليدية بالراحة العصرية، لخلق تجربة لا تُنسى. كل زاوية تحكي قصة من التراث والدفء.
                </p>
              </div>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/4ac9baa4e028075d350c2a1ed1311b743d62a4c1?width=240"
                alt="Coffee Shop Atmosphere"
                className="w-full h-36 object-cover rounded-3xl shadow-lg"
              />
            </div>
          </div>

          {/* Premium Ingredients Section */}
          <div className="glass-notification rounded-3xl p-6 h-48 mb-8">
            <div className="grid grid-cols-3 gap-4 h-full">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/6215394a54d008271dc85cfe08d1006d613dac03?width=242"
                alt="Premium Coffee Beans"
                className="w-full h-36 object-cover rounded-3xl"
              />
              <div className="col-span-2 flex flex-col justify-center text-white text-xs leading-5">
                <h3 className="font-bold mb-2 text-sm">مكونات فاخرة</h3>
                <p className="text-right">
                  نختار فقط أرقى المكونات، من حبوب القهوة الفاخرة إلى الأعشاب الطازجة، لضمان أن كل رشفة استثنائية. الجودة هي وعدنا لك
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-coffee-gold px-6 py-6">
          {/* Logo */}
          <div className="flex justify-end mb-4">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/36982e46b0b8d98546ddabcdca52cdc3dbd4c47f?width=182"
              alt="موال مراكش طواجن"
              className="w-24 h-16 object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Working Hours */}
            <div className="text-center">
              <h4 className="text-white text-sm font-semibold mb-2">أوقات العمل</h4>
              <div className="w-24 h-px bg-coffee-primary mx-auto mb-2"></div>
              <p className="text-white text-sm mb-1">مفتوح 24 ساعة</p>
              <p className="text-white text-sm">جميع ايام الاسبوع</p>
            </div>

            {/* Contact Info */}
            <div className="text-center">
              <h4 className="text-white text-sm font-semibold mb-2">تواصل معنا</h4>
              <div className="w-24 h-px bg-coffee-primary mx-auto mb-2"></div>
              <p className="text-white text-xs mb-1">المدينة المنورة _حي النبلاء</p>
              <p className="text-white text-sm">966567833138+</p>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center space-x-2 mt-6">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/9847c593bb964595b310f34f1252e74193f86dea?width=42" alt="Social" className="w-5 h-4" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/35eaab4fef42eda826b4de533ea775b9ad0b81a9?width=42" alt="Social" className="w-5 h-4" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/43925dc1b52691edf4fa6ca8dd91ee42ede94a59?width=42" alt="Social" className="w-5 h-4" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/d077d93db1664d870170713a6cc1ab80f1c71ac6?width=40" alt="Social" className="w-5 h-4" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/631a75b08fec0a65d55bb799e45eab6d7995350d?width=42" alt="Social" className="w-5 h-4" />
          </div>
        </div>

      </div>
    </div>
  );
}
