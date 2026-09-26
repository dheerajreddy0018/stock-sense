import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { stockService } from '../../services/stockService';
import { COLLECTIONS } from '../../firebase/collections';
import { Adjustment } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SlidersHorizontal, CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AdjustmentsView: React.FC = () => {
  const { user } = useAuth();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    return dbService.subscribe<Adjustment>(COLLECTIONS.ADJUSTMENTS, setAdjustments);
  }, []);

  const handleApplyAdjustment = async (adj: Adjustment) => {
    setProcessingId(adj.id);
    try {
      for (const item of adj.items) {
        await stockService.adjustStock({
          productId: item.productId,
          warehouseId: adj.warehouseId,
          locationId: adj.locationId,
          newCountedQuantity: item.countedQuantity,
          reason: adj.reason,
          referenceId: adj.adjustmentNumber,
          performedBy: user?.id || 'mgr',
          performedByName: user?.displayName || 'Inventory Controller',
          notes: adj.notes || `Reconciliation variance ${item.differenceQuantity}`,
        });
      }

      await dbService.update<Adjustment>(COLLECTIONS.ADJUSTMENTS, adj.id, {
        status: 'APPLIED',
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Adjustment failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Inventory Adjustments
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Physical cycle count reconciliations, shrinkage, and damage write-offs
          </p>
        </div>
      </div>

      <div className="enterprise-card p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adjustment #</TableHead>
              <TableHead>Facility / Zone</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>SKU & Variance</TableHead>
              <TableHead>Recorded vs Counted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((adj) => (
              <TableRow key={adj.id}>
                <TableCell className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                  {adj.adjustmentNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200">
                    <Building2 size={12} className="text-slate-400" />
                    <span>{adj.warehouseName}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{adj.locationName}</span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {adj.reason}
                  </span>
                </TableCell>
                <TableCell>
                  {adj.items.map((it, idx) => (
                    <div key={idx} className="font-mono text-xs">
                      <span className="text-slate-700 dark:text-slate-300 block">{it.sku}</span>
                      <span
                        className={`font-semibold ${
                          it.differenceQuantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {it.differenceQuantity > 0 ? `+${it.differenceQuantity}` : it.differenceQuantity} units
                      </span>
                    </div>
                  ))}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {adj.items.map((it, idx) => (
                    <div key={idx} className="text-slate-600 dark:text-slate-300">
                      <span>{it.recordedQuantity} rec</span> →{' '}
                      <strong className="text-slate-900 dark:text-white font-semibold">{it.countedQuantity} count</strong>
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {adj.status === 'APPLIED' ? (
                    <Badge variant="success" dot>Reconciled</Badge>
                  ) : (
                    <Badge variant="warning" dot>Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {adj.status !== 'APPLIED' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={processingId === adj.id}
                      onClick={() => handleApplyAdjustment(adj)}
                    >
                      <CheckCircle2 size={12} />
                      <span>Post Adjustment</span>
                    </Button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-1">
                      <CheckCircle2 size={12} /> Applied
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
