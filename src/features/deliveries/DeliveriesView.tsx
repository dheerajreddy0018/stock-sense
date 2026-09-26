import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { stockService } from '../../services/stockService';
import { COLLECTIONS } from '../../firebase/collections';
import { Delivery } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowUpFromLine, CheckCircle2, Send, Building2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const DeliveriesView: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    return dbService.subscribe<Delivery>(COLLECTIONS.DELIVERIES, setDeliveries);
  }, []);

  const handleValidateDelivery = async (delivery: Delivery) => {
    setProcessingId(delivery.id);
    try {
      for (const item of delivery.items) {
        await stockService.decreaseStock({
          productId: item.productId,
          warehouseId: delivery.warehouseId,
          locationId: delivery.sourceLocationId,
          quantity: item.quantityOrdered,
          referenceType: 'DELIVERY',
          referenceId: delivery.deliveryNumber,
          performedBy: user?.id || 'staff',
          performedByName: user?.displayName || 'Outbound Staff',
          notes: `Delivery order dispatched to ${delivery.customerName} (${delivery.deliveryNumber})`,
        });
      }

      await dbService.update<Delivery>(COLLECTIONS.DELIVERIES, delivery.id, {
        status: 'DONE',
        effectiveDate: new Date().toISOString(),
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delivery fulfillment failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpFromLine className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customer Deliveries
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pick, pack, ship customer orders and dispatch verification
          </p>
        </div>
      </div>

      <div className="enterprise-card p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delivery Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Dispatch Bay</TableHead>
              <TableHead>Items Ordered</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((del) => (
              <TableRow key={del.id}>
                <TableCell className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                  {del.deliveryNumber}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white block">{del.customerName}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{del.customerAddress}</span>
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Building2 size={12} className="text-slate-400" />
                    <span>{del.warehouseName}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{del.sourceLocationName}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {del.items.map((it, idx) => (
                      <div key={idx} className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        {it.quantityOrdered}x <span className="text-slate-500 dark:text-slate-400">{it.sku}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(del.scheduledDate)}
                </TableCell>
                <TableCell>
                  {del.status === 'DONE' ? (
                    <Badge variant="success" dot>Dispatched</Badge>
                  ) : del.status === 'READY' ? (
                    <Badge variant="warning" dot>Staged</Badge>
                  ) : (
                    <Badge variant="neutral" dot>Waiting Pick</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {del.status !== 'DONE' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={processingId === del.id}
                      onClick={() => handleValidateDelivery(del)}
                    >
                      <Send size={12} />
                      <span>Dispatch Order</span>
                    </Button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-1">
                      <CheckCircle2 size={12} /> Delivered
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
