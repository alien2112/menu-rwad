"use client";

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder = "ابحث في القائمة..." }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="px-4 mb-6">
      <div className="relative max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/60 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-12 py-3 text-foreground placeholder-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#C2914A] focus:border-transparent transition-all duration-300"
            dir="rtl"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

