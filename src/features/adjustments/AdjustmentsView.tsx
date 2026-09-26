import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { stockService } from '../../services/stockService';
import { COLLECTIONS } from '../../firebase/collections';
import { Adjustment } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SlidersHorizontal, CheckCircle2, Info, Building2 } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Inventory Physical Adjustments
            </h1>
            <Badge variant="danger" size="sm">
              Member 3 Module
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cycle count variance reconciliation, scrap, shrinkage, and damage write-offs
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="text-slate-200">Integration Notice for Member 3 (Adjustments):</strong> Never manually overwrite product quantities. Calling <code className="font-mono text-rose-400">stockService.adjustStock()</code> automatically computes the positive or negative delta and enforces the canonical Stock Formula.
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adjustment #</TableHead>
              <TableHead>Location</TableHead>
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
                <TableCell className="font-mono text-rose-400 font-bold">
                  {adj.adjustmentNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <Building2 size={12} className="text-slate-400" />
                    <span>{adj.warehouseName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{adj.locationName}</span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {adj.reason}
                  </span>
                </TableCell>
                <TableCell>
                  {adj.items.map((it, idx) => (
                    <div key={idx} className="font-mono text-xs">
                      <span className="text-slate-300 block">{it.sku}</span>
                      <span
                        className={`font-bold ${
                          it.differenceQuantity > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {it.differenceQuantity > 0 ? `+${it.differenceQuantity}` : it.differenceQuantity} units
                      </span>
                    </div>
                  ))}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {adj.items.map((it, idx) => (
                    <div key={idx} className="text-slate-300">
                      <span>{it.recordedQuantity} rec</span> →{' '}
                      <strong className="text-white">{it.countedQuantity} count</strong>
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {adj.status === 'APPLIED' ? (
                    <Badge variant="success" dot>Applied to Ledger</Badge>
                  ) : (
                    <Badge variant="warning" dot>Pending Review</Badge>
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
                      <CheckCircle2 size={13} />
                      <span>Post Adjustment</span>
                    </Button>
                  ) : (
                    <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                      <CheckCircle2 size={13} /> Reconciled
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
