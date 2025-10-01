'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const presetColors = [
  '#4F3500', // Coffee brown
  '#00BF89', // Green
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#A8E6CF', // Mint
  '#FF8B94', // Pink
  '#C7CEEA', // Lavender
  '#B4A7D6', // Purple
  '#FFD3B6', // Peach
  '#FFAAA5', // Coral
  '#95E1D3', // Aqua
];

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-white">{label}</label>}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 glass-effect rounded-xl text-white hover:bg-white/10 transition-colors"
        >
          <div
            className="w-8 h-8 rounded-lg border-2 border-white/20"
            style={{ backgroundColor: value }}
          />
          <span className="flex-1 text-right">{value}</span>
          <Palette size={20} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-sidebar rounded-xl p-4 z-50 border border-white/10">
            {/* Preset Colors */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110 ${
                    value === color ? 'border-white scale-110' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="space-y-2">
              <label className="text-xs text-white/70">لون مخصص</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white text-sm border border-white/20 focus:border-coffee-green focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleColorSelect(customColor)}
                  className="px-4 py-2 glass-green-button rounded-lg text-white text-sm font-semibold hover:bg-coffee-green transition-colors"
                >
                  تطبيق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
