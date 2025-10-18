/**
 * Unit Conversion System
 * Handles automatic conversion between different units
 */

export enum UnitType {
  // Weight
  GRAM = 'g',
  KILOGRAM = 'kg',
  MILLIGRAM = 'mg',
  POUND = 'lb',
  OUNCE = 'oz',

  // Volume
  MILLILITER = 'ml',
  LITER = 'l',
  CUP = 'cup',
  TABLESPOON = 'tbsp',
  TEASPOON = 'tsp',

  // Count
  PIECE = 'piece',
  UNIT = 'unit',
  DOZEN = 'dozen',

  // Other
  SERVING = 'serving',
  PORTION = 'portion',
}

export const UNIT_LABELS = {
  // Weight
  [UnitType.GRAM]: { ar: 'جرام', en: 'Gram' },
  [UnitType.KILOGRAM]: { ar: 'كيلوجرام', en: 'Kilogram' },
  [UnitType.MILLIGRAM]: { ar: 'مليجرام', en: 'Milligram' },
  [UnitType.POUND]: { ar: 'رطل', en: 'Pound' },
  [UnitType.OUNCE]: { ar: 'أونصة', en: 'Ounce' },

  // Volume
  [UnitType.MILLILITER]: { ar: 'مليلتر', en: 'Milliliter' },
  [UnitType.LITER]: { ar: 'لتر', en: 'Liter' },
  [UnitType.CUP]: { ar: 'كوب', en: 'Cup' },
  [UnitType.TABLESPOON]: { ar: 'ملعقة كبيرة', en: 'Tablespoon' },
  [UnitType.TEASPOON]: { ar: 'ملعقة صغيرة', en: 'Teaspoon' },

  // Count
  [UnitType.PIECE]: { ar: 'قطعة', en: 'Piece' },
  [UnitType.UNIT]: { ar: 'وحدة', en: 'Unit' },
  [UnitType.DOZEN]: { ar: 'دستة', en: 'Dozen' },

  // Other
  [UnitType.SERVING]: { ar: 'حصة', en: 'Serving' },
  [UnitType.PORTION]: { ar: 'جزء', en: 'Portion' },
};

// Conversion factors to base units (gram for weight, ml for volume)
const WEIGHT_CONVERSIONS: Record<string, number> = {
  [UnitType.GRAM]: 1,
  [UnitType.KILOGRAM]: 1000,
  [UnitType.MILLIGRAM]: 0.001,
  [UnitType.POUND]: 453.592,
  [UnitType.OUNCE]: 28.3495,
};

const VOLUME_CONVERSIONS: Record<string, number> = {
  [UnitType.MILLILITER]: 1,
  [UnitType.LITER]: 1000,
  [UnitType.CUP]: 240,
  [UnitType.TABLESPOON]: 15,
  [UnitType.TEASPOON]: 5,
};

const COUNT_CONVERSIONS: Record<string, number> = {
  [UnitType.PIECE]: 1,
  [UnitType.UNIT]: 1,
  [UnitType.DOZEN]: 12,
  [UnitType.SERVING]: 1,
  [UnitType.PORTION]: 1,
};

export enum UnitCategory {
  WEIGHT = 'weight',
  VOLUME = 'volume',
  COUNT = 'count',
}

export function getUnitCategory(unit: string): UnitCategory | null {
  if (unit in WEIGHT_CONVERSIONS) return UnitCategory.WEIGHT;
  if (unit in VOLUME_CONVERSIONS) return UnitCategory.VOLUME;
  if (unit in COUNT_CONVERSIONS) return UnitCategory.COUNT;
  return null;
}

/**
 * Convert quantity from one unit to another
 * @param quantity - Amount to convert
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Converted quantity or null if units are incompatible
 */
export function convertUnit(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  // If same unit, no conversion needed
  if (fromUnit === toUnit) return quantity;

  const fromCategory = getUnitCategory(fromUnit);
  const toCategory = getUnitCategory(toUnit);

  // Can only convert within same category
  if (!fromCategory || !toCategory || fromCategory !== toCategory) {
    console.warn(`Cannot convert from ${fromUnit} to ${toUnit} - different categories`);
    return null;
  }

  // Get conversion factors
  let conversions: Record<string, number>;
  switch (fromCategory) {
    case UnitCategory.WEIGHT:
      conversions = WEIGHT_CONVERSIONS;
      break;
    case UnitCategory.VOLUME:
      conversions = VOLUME_CONVERSIONS;
      break;
    case UnitCategory.COUNT:
      conversions = COUNT_CONVERSIONS;
      break;
    default:
      return null;
  }

  // Convert: from -> base -> to
  const inBaseUnit = quantity * conversions[fromUnit];
  const result = inBaseUnit / conversions[toUnit];

  return result;
}

/**
 * Format unit display with quantity
 */
export function formatQuantityWithUnit(
  quantity: number,
  unit: string,
  lang: 'ar' | 'en' = 'ar'
): string {
  const unitLabel = UNIT_LABELS[unit as UnitType];
  if (!unitLabel) return `${quantity} ${unit}`;

  return `${quantity} ${unitLabel[lang]}`;
}

/**
 * Get all units in a category
 */
export function getUnitsInCategory(category: UnitCategory): UnitType[] {
  switch (category) {
    case UnitCategory.WEIGHT:
      return [
        UnitType.GRAM,
        UnitType.KILOGRAM,
        UnitType.MILLIGRAM,
        UnitType.POUND,
        UnitType.OUNCE,
      ];
    case UnitCategory.VOLUME:
      return [
        UnitType.MILLILITER,
        UnitType.LITER,
        UnitType.CUP,
        UnitType.TABLESPOON,
        UnitType.TEASPOON,
      ];
    case UnitCategory.COUNT:
      return [
        UnitType.PIECE,
        UnitType.UNIT,
        UnitType.DOZEN,
        UnitType.SERVING,
        UnitType.PORTION,
      ];
  }
}

/**
 * Check if two units are compatible for conversion
 */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const cat1 = getUnitCategory(unit1);
  const cat2 = getUnitCategory(unit2);
  return cat1 !== null && cat1 === cat2;
}

/**
 * Example usage:
 *
 * // Menu item uses 250g chicken
 * // Inventory tracks in kg
 * const inventoryAmount = convertUnit(250, UnitType.GRAM, UnitType.KILOGRAM);
 * // Result: 0.25 kg
 *
 * // Material is 5kg, sync to inventory in grams
 * const inventoryGrams = convertUnit(5, UnitType.KILOGRAM, UnitType.GRAM);
 * // Result: 5000 g
 */
