import React, { useState, useEffect } from 'react';
import { Product, StockLedgerEntry } from '../../types';
import { dbService } from '../../services/databaseService';
import { COLLECTIONS } from '../../firebase/collections';
import {
  BookOpen,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Sparkles,
  Calendar,
  User,
  MapPin,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface InventoryStoryProps {
  productId?: string;
  product?: Product;
  className?: string;
}

export const InventoryStory: React.FC<InventoryStoryProps> = ({
  productId,
  product: propProduct,
  className,
}) => {
  const [product, setProduct] = useState<Product | null>(propProduct || null);
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propProduct) {
      setProduct(propProduct);
    }
  }, [propProduct]);

  useEffect(() => {
    const targetId = productId || product?.id;
    if (!targetId) return;

    setLoading(true);

    if (!product) {
      dbService.getById<Product>(COLLECTIONS.PRODUCTS, targetId).then((p) => {
        if (p) setProduct(p);
      });
    }

    dbService.getAll<StockLedgerEntry>(COLLECTIONS.STOCK_LEDGER).then((all) => {
      const filtered = all
        .filter((e) => e.productId === targetId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setEntries(filtered);
      setLoading(false);
    });
  }, [productId, product?.id]);

  const getMovementIcon = (type: StockLedgerEntry['movementType']) => {
    switch (type) {
      case 'OPENING_STOCK':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'RECEIPT':
        return <ArrowDownToLine className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
      case 'DELIVERY':
        return <ArrowUpFromLine className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'INTERNAL_TRANSFER_IN':
      case 'INTERNAL_TRANSFER_OUT':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      case 'ADJUSTMENT_POSITIVE':
      case 'ADJUSTMENT_NEGATIVE':
        return <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
    }
  };

  const getStorySummary = () => {
    if (!entries.length) return 'No recorded movements yet for this SKU.';
    const totalInward = entries
      .filter((e) => e.quantityDelta > 0)
      .reduce((sum, e) => sum + e.quantityDelta, 0);
    const totalOutward = entries
      .filter((e) => e.quantityDelta < 0)
      .reduce((sum, e) => sum + Math.abs(e.quantityDelta), 0);

    return `This item has an active lifecycle of ${entries.length} audited ledger transactions. Over its operational lifespan, ${totalInward} units entered storage and ${totalOutward} units were fulfilled or transferred.`;
  };

  return (
    <div className={`enterprise-card p-5 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">Inventory Story</h3>
        </div>
        {product && (
          <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {product.sku}
          </span>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
        {getStorySummary()}
      </p>

      {/* Narrative Timeline */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading timeline...</div>
        ) : entries.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No ledger events recorded for this SKU yet.
          </div>
        ) : (
          <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {entries.map((entry) => (
              <div key={entry.id} className="relative group text-xs">
                {/* Timeline Dot */}
                <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                <div className="p-3 rounded-lg bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                      {getMovementIcon(entry.movementType)}
                      <span className="capitalize">
                        {entry.movementType.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>

                    <span
                      className={`font-mono font-semibold ${
                        entry.quantityDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {entry.quantityDelta > 0 ? `+${entry.quantityDelta}` : entry.quantityDelta}{' '}
                      units
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{entry.notes}</p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(entry.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {entry.warehouseName} ({entry.locationName})
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={11} /> {entry.performedByName}
                    </span>
                    <span className="ml-auto text-slate-600 dark:text-slate-300">
                      Balance: <strong className="text-slate-900 dark:text-white">{entry.balanceAfter}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
