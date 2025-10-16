"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Square, CheckSquare } from "lucide-react";

export interface ModifierOption {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  isDefault?: boolean;
}

export interface Modifier {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  type: 'single' | 'multiple';
  options: ModifierOption[];
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
}

export interface SelectedModifier {
  modifierId: string;
  modifierName: string;
  selectedOptions: {
    id: string;
    name: string;
    price: number;
  }[];
}

interface ModifierSelectorProps {
  modifiers: Modifier[];
  onSelectionChange: (selections: SelectedModifier[], totalPrice: number) => void;
  basePrice: number;
}

export const ModifierSelector = ({
  modifiers,
  onSelectionChange,
  basePrice,
}: ModifierSelectorProps) => {
  const [selections, setSelections] = useState<Map<string, Set<string>>>(new Map());

  // Initialize default selections
  useEffect(() => {
    const defaultSelections = new Map<string, Set<string>>();

    modifiers.forEach((modifier) => {
      const defaults = modifier.options
        .filter((opt) => opt.isDefault)
        .map((opt) => opt.id);

      if (defaults.length > 0) {
        defaultSelections.set(modifier._id, new Set(defaults));
      } else if (modifier.required && modifier.type === 'single' && modifier.options.length > 0) {
        // Auto-select first option for required single-select modifiers
        defaultSelections.set(modifier._id, new Set([modifier.options[0].id]));
      }
    });

    setSelections(defaultSelections);
  }, [modifiers]);

  // Calculate and notify parent of changes
  useEffect(() => {
    const selectedModifiers: SelectedModifier[] = [];
    let totalModifierPrice = 0;

    modifiers.forEach((modifier) => {
      const selectedOptionIds = selections.get(modifier._id);
      if (selectedOptionIds && selectedOptionIds.size > 0) {
        const selectedOptions = modifier.options
          .filter((opt) => selectedOptionIds.has(opt.id))
          .map((opt) => {
            totalModifierPrice += opt.price;
            return {
              id: opt.id,
              name: opt.name,
              price: opt.price,
            };
          });

        if (selectedOptions.length > 0) {
          selectedModifiers.push({
            modifierId: modifier._id,
            modifierName: modifier.name,
            selectedOptions,
          });
        }
      }
    });

    const totalPrice = basePrice + totalModifierPrice;
    onSelectionChange(selectedModifiers, totalPrice);
  }, [selections, modifiers, basePrice, onSelectionChange]);

  const handleSingleSelect = (modifierId: string, optionId: string) => {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      newSelections.set(modifierId, new Set([optionId]));
      return newSelections;
    });
  };

  const handleMultipleSelect = (modifierId: string, optionId: string, modifier: Modifier) => {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const currentSelections = newSelections.get(modifierId) || new Set<string>();
      const newSet = new Set(currentSelections);

      if (newSet.has(optionId)) {
        // Check if we can deselect (respect minSelections)
        if (modifier.minSelections && newSet.size <= modifier.minSelections) {
          return prev; // Cannot deselect
        }
        newSet.delete(optionId);
      } else {
        // Check if we can select (respect maxSelections)
        if (modifier.maxSelections && newSet.size >= modifier.maxSelections) {
          return prev; // Cannot select more
        }
        newSet.add(optionId);
      }

      newSelections.set(modifierId, newSet);
      return newSelections;
    });
  };

  const isSelected = (modifierId: string, optionId: string): boolean => {
    return selections.get(modifierId)?.has(optionId) || false;
  };

  const canSelect = (modifierId: string, modifier: Modifier): boolean => {
    if (modifier.type === 'single') return true;

    const currentSelections = selections.get(modifierId);
    if (!currentSelections) return true;

    if (modifier.maxSelections && currentSelections.size >= modifier.maxSelections) {
      return false;
    }

    return true;
  };

  if (modifiers.length === 0) return null;

  return (
    <div className="space-y-6">
      {modifiers.map((modifier) => {
        const currentSelections = selections.get(modifier._id);
        const selectionCount = currentSelections?.size || 0;

        return (
          <motion.div
            key={modifier._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-sm rounded-xl p-5 border border-white/10"
          >
            {/* Modifier Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {modifier.name}
                    {modifier.required && (
                      <span className="text-red-400 mr-1">*</span>
                    )}
                  </h3>
                  {modifier.nameEn && (
                    <p className="text-sm text-muted-foreground">{modifier.nameEn}</p>
                  )}
                </div>

                {/* Selection Count for Multiple */}
                {modifier.type === 'multiple' && (
                  <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30">
                    {selectionCount}
                    {modifier.maxSelections ? ` / ${modifier.maxSelections}` : ''}
                  </span>
                )}
              </div>

              {/* Description */}
              {modifier.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {modifier.description}
                </p>
              )}

              {/* Helper Text */}
              <p className="text-xs text-muted-foreground">
                {modifier.type === 'single' ? (
                  'اختر خياراً واحداً'
                ) : (
                  <>
                    {modifier.minSelections && modifier.maxSelections
                      ? `اختر من ${modifier.minSelections} إلى ${modifier.maxSelections} خيارات`
                      : modifier.maxSelections
                      ? `اختر حتى ${modifier.maxSelections} خيارات`
                      : modifier.minSelections
                      ? `اختر ${modifier.minSelections} خيارات على الأقل`
                      : 'اختر خيارات متعددة'}
                  </>
                )}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {modifier.options.map((option) => {
                const selected = isSelected(modifier._id, option.id);
                const disabled = !selected && !canSelect(modifier._id, modifier);

                return (
                  <motion.button
                    key={option.id}
                    onClick={() =>
                      modifier.type === 'single'
                        ? handleSingleSelect(modifier._id, option.id)
                        : handleMultipleSelect(modifier._id, option.id, modifier)
                    }
                    disabled={disabled}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                      selected
                        ? 'bg-primary/20 border-2 border-primary'
                        : disabled
                        ? 'bg-card/30 border border-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-card/30 border border-white/10 hover:border-white/30 hover:bg-card/50'
                    }`}
                    whileHover={!disabled ? { scale: 1.02 } : {}}
                    whileTap={!disabled ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      {modifier.type === 'single' ? (
                        selected ? (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )
                      ) : selected ? (
                        <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}

                      {/* Label */}
                      <div className="text-right">
                        <p className={`font-medium ${selected ? 'text-foreground' : 'text-foreground/80'}`}>
                          {option.name}
                        </p>
                        {option.nameEn && (
                          <p className="text-xs text-muted-foreground">{option.nameEn}</p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    {option.price > 0 && (
                      <span className={`font-bold text-sm ${selected ? 'text-primary' : 'text-foreground/60'}`}>
                        +{option.price.toFixed(2)} ر.س
                      </span>
                    )}
                    {option.price === 0 && (
                      <span className="text-xs text-muted-foreground">مجاناً</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
