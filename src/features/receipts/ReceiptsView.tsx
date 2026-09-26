import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { stockService } from '../../services/stockService';
import { COLLECTIONS } from '../../firebase/collections';
import { Receipt } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowDownToLine, CheckCircle2, Building2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const ReceiptsView: React.FC = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    return dbService.subscribe<Receipt>(COLLECTIONS.RECEIPTS, setReceipts);
  }, []);

  const handleValidateReceipt = async (receipt: Receipt) => {
    setProcessingId(receipt.id);
    try {
      for (const item of receipt.items) {
        await stockService.increaseStock({
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          locationId: receipt.targetLocationId,
          quantity: item.quantityExpected,
          referenceType: 'RECEIPT',
          referenceId: receipt.receiptNumber,
          performedBy: user?.id || 'staff',
          performedByName: user?.displayName || 'Receiving Staff',
          notes: `Goods received from ${receipt.supplierName} (${receipt.receiptNumber})`,
        });
      }

      await dbService.update<Receipt>(COLLECTIONS.RECEIPTS, receipt.id, {
        status: 'DONE',
        effectiveDate: new Date().toISOString(),
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Receipt validation failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Inward Stock Receipts
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supplier purchase order goods inwarding, gate validation, and dock putaway
          </p>
        </div>
      </div>

      <div className="enterprise-card p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt Docket</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Facility / Dock</TableHead>
              <TableHead>Items Expected</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((rcp) => (
              <TableRow key={rcp.id}>
                <TableCell className="font-mono text-sky-600 dark:text-sky-400 font-semibold">
                  {rcp.receiptNumber}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white block">{rcp.supplierName}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{rcp.supplierContact}</span>
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Building2 size={12} className="text-slate-400" />
                    <span>{rcp.warehouseName}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{rcp.targetLocationName}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {rcp.items.map((it, idx) => (
                      <div key={idx} className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        {it.quantityExpected}x <span className="text-slate-500 dark:text-slate-400">{it.sku}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(rcp.scheduledDate)}
                </TableCell>
                <TableCell>
                  {rcp.status === 'DONE' ? (
                    <Badge variant="success" dot>Stored</Badge>
                  ) : rcp.status === 'READY' ? (
                    <Badge variant="info" dot>Dock Ready</Badge>
                  ) : (
                    <Badge variant="warning" dot>Waiting Inward</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {rcp.status !== 'DONE' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={processingId === rcp.id}
                      onClick={() => handleValidateReceipt(rcp)}
                    >
                      <CheckCircle2 size={13} />
                      <span>Inward Stock</span>
                    </Button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-1">
                      <CheckCircle2 size={12} /> Stored
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
