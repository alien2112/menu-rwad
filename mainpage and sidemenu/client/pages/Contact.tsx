import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function Contact() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-primary relative overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="relative z-10 mobile-container bg-coffee-primary coffee-shadow min-h-screen">
        <div className="px-6 pt-8">
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
          
          <div className="text-center pt-16">
            <h1 className="arabic-title text-4xl text-white mb-8">CONNECT US</h1>
            <div className="glass-notification rounded-3xl p-8">
              <p className="text-white text-center">
                This page content will be added later. Please continue prompting to fill in this page if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
