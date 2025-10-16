"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Clock, Phone, X, Navigation } from "lucide-react";

interface Branch {
  _id: string;
  name: string;
  nameEn?: string;
  slug: string;
  address: string;
  phone: string;
  location?: {
    lat: number;
    lng: number;
  };
  isMainBranch: boolean;
  isActive: boolean;
  isOpenNow?: boolean;
  status: 'active' | 'inactive' | 'coming_soon';
}

interface BranchSwitcherProps {
  onBranchChange?: (branchId: string) => void;
  selectedBranchId?: string;
  className?: string;
}

export const BranchSwitcher = ({
  onBranchChange,
  selectedBranchId,
  className = "",
}: BranchSwitcherProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId && branches.length > 0) {
      const branch = branches.find(b => b._id === selectedBranchId);
      if (branch) {
        setSelectedBranch(branch);
      }
    } else if (branches.length > 0 && !selectedBranch) {
      // Select main branch by default, or first active branch
      const mainBranch = branches.find(b => b.isMainBranch && b.isActive);
      const defaultBranch = mainBranch || branches.find(b => b.isActive) || branches[0];
      setSelectedBranch(defaultBranch);
      if (onBranchChange && defaultBranch) {
        onBranchChange(defaultBranch._id);
      }
    }
  }, [selectedBranchId, branches]);

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/branches");
      const data = await response.json();

      if (data.success) {
        // Filter only active branches
        const activeBranches = data.data.filter(
          (b: Branch) => b.isActive && b.status === 'active'
        );
        setBranches(activeBranches);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsOpen(false);
    if (onBranchChange) {
      onBranchChange(branch._id);
    }
  };

  const getDirections = (branch: Branch) => {
    if (branch.location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${branch.location.lat},${branch.location.lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading || branches.length === 0) {
    return null;
  }

  // If only one branch, don't show switcher
  if (branches.length === 1) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Branch Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 bg-card hover:bg-card/80 border border-border rounded-lg transition-all"
      >
        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1 text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="font-semibold text-foreground">
              {selectedBranch?.name || "اختر الفرع"}
            </span>
            {selectedBranch?.isOpenNow && (
              <span className="inline-flex items-center gap-1 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                مفتوح الآن
              </span>
            )}
          </div>
          {selectedBranch && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {selectedBranch.address}
            </p>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border border-border rounded-lg shadow-xl max-h-[400px] overflow-y-auto"
            >
              {branches.map((branch) => (
                <div
                  key={branch._id}
                  className={`p-4 border-b border-border last:border-b-0 hover:bg-background/50 transition-colors cursor-pointer ${
                    selectedBranch?._id === branch._id ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleBranchSelect(branch)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Branch Name */}
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {branch.name}
                        </h4>
                        {branch.isMainBranch && (
                          <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
                            رئيسي
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{branch.address}</span>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <a
                          href={`tel:${branch.phone}`}
                          className="hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {branch.phone}
                        </a>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        {branch.isOpenNow ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                            <Clock className="w-3.5 h-3.5" />
                            مفتوح الآن
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
                            <Clock className="w-3.5 h-3.5" />
                            مغلق الآن
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Directions Button */}
                    {branch.location && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          getDirections(branch);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        اتجاهات
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
