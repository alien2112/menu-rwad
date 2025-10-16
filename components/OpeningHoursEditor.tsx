"use client";

import { useState } from "react";
import { Clock, X } from "lucide-react";
import { motion } from "framer-motion";

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

interface OpeningHoursEditorProps {
  hours: OpeningHours[];
  onChange: (hours: OpeningHours[]) => void;
}

const DAYS = [
  { key: 'monday', label: 'الإثنين', labelEn: 'Monday' },
  { key: 'tuesday', label: 'الثلاثاء', labelEn: 'Tuesday' },
  { key: 'wednesday', label: 'الأربعاء', labelEn: 'Wednesday' },
  { key: 'thursday', label: 'الخميس', labelEn: 'Thursday' },
  { key: 'friday', label: 'الجمعة', labelEn: 'Friday' },
  { key: 'saturday', label: 'السبت', labelEn: 'Saturday' },
  { key: 'sunday', label: 'الأحد', labelEn: 'Sunday' },
];

export const OpeningHoursEditor = ({ hours, onChange }: OpeningHoursEditorProps) => {
  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    const updated = hours.map(h =>
      h.day === day ? { ...h, [field]: value } : h
    );
    onChange(updated);
  };

  const handleClosedToggle = (day: string) => {
    const updated = hours.map(h =>
      h.day === day ? { ...h, isClosed: !h.isClosed } : h
    );
    onChange(updated);
  };

  const applyToAllDays = (sourceDay: string) => {
    const sourceHours = hours.find(h => h.day === sourceDay);
    if (!sourceHours) return;

    const updated = hours.map(h => ({
      ...h,
      open: sourceHours.open,
      close: sourceHours.close,
      isClosed: sourceHours.isClosed,
    }));

    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">ساعات العمل</h3>
        </div>
      </div>

      <div className="space-y-3">
        {DAYS.map((day, index) => {
          const dayHours = hours.find(h => h.day === day.key) || {
            day: day.key,
            open: '09:00',
            close: '23:00',
            isClosed: false,
          };

          return (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-card rounded-lg p-4 border transition-all ${
                dayHours.isClosed
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Day Name */}
                <div className="flex-shrink-0 w-full sm:w-32">
                  <div className="flex items-center justify-between sm:block">
                    <div>
                      <p className="font-semibold text-foreground">{day.label}</p>
                      <p className="text-xs text-muted-foreground">{day.labelEn}</p>
                    </div>

                    {/* Mobile Closed Toggle */}
                    <label className="flex items-center gap-2 sm:hidden cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayHours.isClosed || false}
                        onChange={() => handleClosedToggle(day.key)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">مغلق</span>
                    </label>
                  </div>
                </div>

                {/* Time Inputs */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">من</label>
                    <input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => handleTimeChange(day.key, 'open', e.target.value)}
                      disabled={dayHours.isClosed}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>

                  <span className="text-muted-foreground mt-5">-</span>

                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">إلى</label>
                    <input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => handleTimeChange(day.key, 'close', e.target.value)}
                      disabled={dayHours.isClosed}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Desktop Closed Toggle */}
                  <label className="hidden sm:flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dayHours.isClosed || false}
                      onChange={() => handleClosedToggle(day.key)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">مغلق</span>
                  </label>

                  {/* Apply to All */}
                  <button
                    type="button"
                    onClick={() => applyToAllDays(day.key)}
                    className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    نسخ للكل
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => {
            const updated = hours.map(h => ({
              ...h,
              open: '09:00',
              close: '23:00',
              isClosed: false,
            }));
            onChange(updated);
          }}
          className="px-4 py-2 bg-card hover:bg-card/80 border border-border rounded-lg text-sm font-medium text-foreground transition-colors"
        >
          ساعات افتراضية (9 ص - 11 م)
        </button>

        <button
          type="button"
          onClick={() => {
            const updated = hours.map(h => ({
              ...h,
              open: '08:00',
              close: '22:00',
              isClosed: h.day === 'friday', // Close on Friday
            }));
            onChange(updated);
          }}
          className="px-4 py-2 bg-card hover:bg-card/80 border border-border rounded-lg text-sm font-medium text-foreground transition-colors"
        >
          إغلاق يوم الجمعة
        </button>

        <button
          type="button"
          onClick={() => {
            const updated = hours.map(h => ({
              ...h,
              isClosed: false,
            }));
            onChange(updated);
          }}
          className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
        >
          فتح جميع الأيام
        </button>
      </div>
    </div>
  );
};
