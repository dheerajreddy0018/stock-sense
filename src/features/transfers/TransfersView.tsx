import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { stockService } from '../../services/stockService';
import { COLLECTIONS } from '../../firebase/collections';
import { Transfer } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowLeftRight, CheckCircle2, Truck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const TransfersView: React.FC = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    return dbService.subscribe<Transfer>(COLLECTIONS.TRANSFERS, setTransfers);
  }, []);

  const handleCompleteTransfer = async (transfer: Transfer) => {
    setProcessingId(transfer.id);
    try {
      for (const item of transfer.items) {
        await stockService.transferStock({
          productId: item.productId,
          sourceWarehouseId: transfer.sourceWarehouseId,
          sourceLocationId: transfer.sourceLocationId,
          targetWarehouseId: transfer.targetWarehouseId,
          targetLocationId: transfer.targetLocationId,
          quantity: item.quantity,
          referenceId: transfer.transferNumber,
          performedBy: user?.id || 'staff',
          performedByName: user?.displayName || 'Logistics Staff',
          notes: `Inter-facility transfer ${transfer.transferNumber} received`,
        });
      }

      await dbService.update<Transfer>(COLLECTIONS.TRANSFERS, transfer.id, {
        status: 'COMPLETED',
        effectiveDate: new Date().toISOString(),
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Transfer completion failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Internal Transfers
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Facility network inventory rebalancing and in-transit monitoring
          </p>
        </div>
      </div>

      <div className="enterprise-card p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer #</TableHead>
              <TableHead>Origin Facility</TableHead>
              <TableHead>Destination Facility</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Fleet Tracking</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((trf) => (
              <TableRow key={trf.id}>
                <TableCell className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {trf.transferNumber}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white block">{trf.sourceWarehouseName}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{trf.sourceLocationName}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white block">{trf.targetWarehouseName}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{trf.targetLocationName}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {trf.items.map((it, idx) => (
                      <div key={idx} className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        {it.quantity}x <span className="text-slate-500 dark:text-slate-400">{it.sku}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <Truck size={12} className="text-slate-400" />
                    <span>{trf.trackingNote || 'Standard Fleet'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {trf.status === 'COMPLETED' ? (
                    <Badge variant="success" dot>Completed</Badge>
                  ) : trf.status === 'IN_TRANSIT' ? (
                    <Badge variant="info" dot>In Transit</Badge>
                  ) : (
                    <Badge variant="neutral" dot>Draft</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {trf.status !== 'COMPLETED' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={processingId === trf.id}
                      onClick={() => handleCompleteTransfer(trf)}
                    >
                      <CheckCircle2 size={12} />
                      <span>Receive Transfer</span>
                    </Button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-1">
                      <CheckCircle2 size={12} /> Completed
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
