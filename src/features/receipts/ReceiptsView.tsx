import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { stockService } from '../../services/stockService';
import { COLLECTIONS } from '../../firebase/collections';
import { Receipt } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowDownToLine, CheckCircle2, Info, Building2 } from 'lucide-react';
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
      // Execute transactional inward stock increment for all items
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
          notes: `Goods received from ${receipt.supplierName} under docket ${receipt.receiptNumber}`,
        });
      }

      // Mark receipt as DONE
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Inward Stock Receipts
            </h1>
            <Badge variant="info" size="sm">
              Member 3 Module
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supplier purchase order goods receipts, gate entries, and dock putaway
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="text-slate-200">Integration Notice for Member 3 (Receipts):</strong> Click <em>"Validate & Inward Stock"</em> below to test live transactional stock increment. It runs <code className="font-mono text-cyan-400">stockService.increaseStock()</code>, which automatically updates the product inventory and posts an immutable entry to the Stock Ledger.
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt Docket</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Warehouse / Dock</TableHead>
              <TableHead>Items Expected</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((rcp) => (
              <TableRow key={rcp.id}>
                <TableCell className="font-mono text-cyan-400 font-bold">
                  {rcp.receiptNumber}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-white block">{rcp.supplierName}</span>
                  <span className="text-[11px] text-slate-400 block">{rcp.supplierContact}</span>
                </TableCell>
                <TableCell className="text-slate-300">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Building2 size={12} className="text-slate-400" />
                    <span>{rcp.warehouseName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{rcp.targetLocationName}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {rcp.items.map((it, idx) => (
                      <div key={idx} className="font-mono text-xs text-slate-300">
                        {it.quantityExpected}x <span className="text-slate-400">{it.sku}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400">
                  {formatDate(rcp.scheduledDate)}
                </TableCell>
                <TableCell>
                  {rcp.status === 'DONE' ? (
                    <Badge variant="success" dot>Received & Stored</Badge>
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
                      <span>Validate & Inward</span>
                    </Button>
                  ) : (
                    <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                      <CheckCircle2 size={13} /> Stored
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
