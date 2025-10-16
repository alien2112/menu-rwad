"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Branch {
  _id: string;
  name: string;
  nameEn?: string;
  city?: string;
  status: 'active' | 'inactive' | 'coming_soon';
  isMainBranch: boolean;
}

interface BranchSelectorProps {
  selectedBranchId?: string | null;
  onBranchChange: (branchId: string | null) => void;
  showAllOption?: boolean;
  className?: string;
}

export function BranchSelector({
  selectedBranchId,
  onBranchChange,
  showAllOption = true,
  className = "",
}: BranchSelectorProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/branches");
      const data = await response.json();

      if (data.success) {
        // Filter only active branches
        const activeBranches = data.data.filter(
          (b: Branch) => b.status === 'active'
        );
        setBranches(activeBranches);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBranch = branches.find((b) => b._id === selectedBranchId);

  const handleSelect = (branchId: string | null) => {
    onBranchChange(branchId);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg ${className}`}>
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 w-full px-4 py-2.5 bg-card hover:bg-card/80 border border-border rounded-lg transition-all text-foreground"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedBranch ? selectedBranch.name : "جميع الفروع"}
          </span>
          {selectedBranch?.isMainBranch && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
              رئيسي
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-full min-w-[280px] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <div className="max-h-[300px] overflow-y-auto">
                {showAllOption && (
                  <button
                    onClick={() => handleSelect(null)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-colors ${
                      !selectedBranchId ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        جميع الفروع
                      </span>
                    </div>
                    {!selectedBranchId && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                )}

                {branches.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      لا توجد فروع نشطة
                    </p>
                  </div>
                ) : (
                  branches.map((branch) => (
                    <button
                      key={branch._id}
                      onClick={() => handleSelect(branch._id)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-colors ${
                        selectedBranchId === branch._id ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {branch.name}
                          </span>
                          {branch.isMainBranch && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                              رئيسي
                            </span>
                          )}
                        </div>
                        {branch.city && (
                          <span className="text-xs text-muted-foreground">
                            {branch.city}
                          </span>
                        )}
                      </div>
                      {selectedBranchId === branch._id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
