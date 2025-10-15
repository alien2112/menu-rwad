import { useState, useEffect } from 'react';

export interface TaxSettings {
  _id?: string;
  enableTaxHandling: boolean;
  taxType: 'VAT' | 'GST' | 'SALES_TAX' | 'CUSTOM';
  vatRate: number;
  includeTaxInPrice: boolean;
  displayTaxBreakdown: boolean;
  generateTaxReports: boolean;
  taxNumber: string | null;
  complianceMode: 'Saudi ZATCA' | 'UAE FTA' | 'GCC' | 'CUSTOM';
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxCalculation {
  originalPrice: number;
  taxAmount: number;
  finalPrice: number;
  displayPrice: number;
  breakdown: {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  };
}

export function useTaxSettings() {
  const [settings, setSettings] = useState<TaxSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaxSettings();
  }, []);

  const fetchTaxSettings = async () => {
    try {
      const response = await fetch('/api/tax-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        setError(data.error || 'Failed to fetch tax settings');
      }
    } catch (err) {
      setError('Failed to fetch tax settings');
      console.error('Error fetching tax settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTax = (price: number): TaxCalculation => {
    if (!settings || !settings.enableTaxHandling) {
      return {
        originalPrice: price,
        taxAmount: 0,
        finalPrice: price,
        displayPrice: price,
        breakdown: {
          subtotal: price,
          taxRate: 0,
          taxAmount: 0,
          total: price
        }
      };
    }

    const taxRate = settings.vatRate / 100;
    
    if (settings.includeTaxInPrice) {
      // Tax is included in the price
      const subtotal = price / (1 + taxRate);
      const taxAmount = price - subtotal;
      
      return {
        originalPrice: price,
        taxAmount,
        finalPrice: price,
        displayPrice: price,
        breakdown: {
          subtotal: Number(subtotal.toFixed(2)),
          taxRate: settings.vatRate,
          taxAmount: Number(taxAmount.toFixed(2)),
          total: price
        }
      };
    } else {
      // Tax is added to the price
      const taxAmount = price * taxRate;
      const total = price + taxAmount;
      
      return {
        originalPrice: price,
        taxAmount,
        finalPrice: total,
        displayPrice: settings.displayTaxBreakdown ? price : total,
        breakdown: {
          subtotal: price,
          taxRate: settings.vatRate,
          taxAmount: Number(taxAmount.toFixed(2)),
          total: Number(total.toFixed(2))
        }
      };
    }
  };

  const formatPrice = (price: number, showCurrency: boolean = true): string => {
    const formatted = price.toFixed(2);
    return showCurrency ? `${formatted} ر.س` : formatted;
  };

  const formatPriceWithTax = (price: number): string => {
    const calculation = calculateTax(price);
    
    if (!settings || !settings.enableTaxHandling) {
      return formatPrice(price);
    }

    if (settings.displayTaxBreakdown && !settings.includeTaxInPrice) {
      return `${formatPrice(calculation.breakdown.subtotal)} + ${formatPrice(calculation.breakdown.taxAmount)} ضريبة`;
    }

    return formatPrice(calculation.displayPrice);
  };

  const getTaxBreakdown = (price: number) => {
    return calculateTax(price).breakdown;
  };

  return {
    settings,
    loading,
    error,
    calculateTax,
    formatPrice,
    formatPriceWithTax,
    getTaxBreakdown,
    refetch: fetchTaxSettings
  };
}





