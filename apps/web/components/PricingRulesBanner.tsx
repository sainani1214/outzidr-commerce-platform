'use client';

import { useEffect, useState } from 'react';

interface PricingRule {
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  conditions: {
    minQuantity?: number;
    maxQuantity?: number;
    minInventory?: number;
    maxInventory?: number;
  };
}

export default function PricingRulesBanner() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active pricing rules
    async function fetchRules() {
      try {
        // This would be an API call to get active pricing rules
        // For now, we'll show common rules based on the implementation
        const commonRules: PricingRule[] = [
          {
            name: 'Bulk Purchase Discount',
            description: 'Get 10% off when buying 5 or more items',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            conditions: { minQuantity: 5 },
          },
          {
            name: 'Large Order Discount',
            description: 'Get 15% off when buying 10 or more items',
            discountType: 'PERCENTAGE',
            discountValue: 15,
            conditions: { minQuantity: 10 },
          },
          {
            name: 'Clearance Sale',
            description: 'Get 20% off on low stock items',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            conditions: { maxInventory: 20 },
          },
        ];
        
        setRules(commonRules);
      } catch (error) {
        console.error('Failed to fetch pricing rules:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRules();
  }, []);

  if (loading || rules.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 border border-[#2A2A30] rounded-2xl p-6 bg-linear-to-r from-blue-500/5 to-purple-500/5">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">🎁</span>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Active Promotions
          </h3>
          <p className="text-sm text-[#9A9AA1]">
            Save more when you buy in bulk or on clearance items!
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="border border-[#2A2A30] rounded-xl p-4 bg-[#0B0B0D]/50 hover:border-blue-500/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold">
                {rule.discountType === 'PERCENTAGE' 
                  ? `${rule.discountValue}% OFF`
                  : `$${rule.discountValue} OFF`
                }
              </span>
            </div>
            <p className="text-sm font-medium text-white mb-1">
              {rule.name}
            </p>
            <p className="text-xs text-[#9A9AA1]">
              {rule.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#2A2A30]">
        <p className="text-xs text-[#9A9AA1] flex items-center gap-2">
          <span>ℹ️</span>
          <span>
            Discounts are automatically applied at checkout based on your cart quantity and product availability
          </span>
        </p>
      </div>
    </div>
  );
}
