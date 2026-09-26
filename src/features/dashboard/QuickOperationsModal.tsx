import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { stockService } from '../../services/stockService';
import { Product, Warehouse, Location } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, SlidersHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuickOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  warehouses: Warehouse[];
  locations: Location[];
}

export const QuickOperationsModal: React.FC<QuickOperationsModalProps> = ({
  isOpen,
  onClose,
  products,
  warehouses,
  locations,
}) => {
  const { user } = useAuth();
  const [opType, setOpType] = useState<'INCREASE' | 'DECREASE' | 'TRANSFER' | 'ADJUST'>('INCREASE');
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [locationId, setLocationId] = useState<string>(locations[0]?.id || '');
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>(warehouses[1]?.id || warehouses[0]?.id || '');
  const [targetLocationId, setTargetLocationId] = useState<string>(locations[1]?.id || locations[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<'CYCLE_COUNT' | 'DAMAGED' | 'EXPIRED' | 'THEFT' | 'DATA_CORRECTION' | 'SCRAP'>('CYCLE_COUNT');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const performedBy = user?.id || 'demo-operator';
      const performedByName = user?.displayName || 'Active Operator';

      if (opType === 'INCREASE') {
        const entry = await stockService.increaseStock({
          productId,
          warehouseId,
          locationId,
          quantity: Number(quantity),
          referenceType: 'MANUAL',
          referenceId: `OP-INC-${Date.now().toString().slice(-4)}`,
          performedBy,
          performedByName,
          notes: notes || 'Direct quick stock inward',
        });
        setSuccessMsg(`Increased stock by ${quantity} units! Ledger balance: ${entry.balanceAfter}`);
      } else if (opType === 'DECREASE') {
        const entry = await stockService.decreaseStock({
          productId,
          warehouseId,
          locationId,
          quantity: Number(quantity),
          referenceType: 'MANUAL',
          referenceId: `OP-DEC-${Date.now().toString().slice(-4)}`,
          performedBy,
          performedByName,
          notes: notes || 'Direct quick stock fulfillment deduction',
        });
        setSuccessMsg(`Decreased stock by ${quantity} units! Ledger balance: ${entry.balanceAfter}`);
      } else if (opType === 'TRANSFER') {
        const result = await stockService.transferStock({
          productId,
          sourceWarehouseId: warehouseId,
          sourceLocationId: locationId,
          targetWarehouseId,
          targetLocationId,
          quantity: Number(quantity),
          referenceId: `OP-TRF-${Date.now().toString().slice(-4)}`,
          performedBy,
          performedByName,
          notes: notes || 'Internal quick transfer',
        });
        setSuccessMsg(`Transferred ${quantity} units! Source: ${result.sourceEntry.balanceAfter}, Target: ${result.targetEntry.balanceAfter}`);
      } else if (opType === 'ADJUST') {
        const entry = await stockService.adjustStock({
          productId,
          warehouseId,
          locationId,
          newCountedQuantity: Number(quantity),
          reason,
          referenceId: `OP-ADJ-${Date.now().toString().slice(-4)}`,
          performedBy,
          performedByName,
          notes: notes || `Cycle count reconciled to ${quantity}`,
        });
        setSuccessMsg(`Stock reconciled to ${quantity} units! Difference delta: ${entry.quantityDelta}`);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="StockSense Core Engine Dispatcher"
      description="Execute transactional inventory movements directly through the single source of truth"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Operation Type Switcher */}
        <div className="grid grid-cols-4 gap-2 pb-2">
          <button
            type="button"
            onClick={() => setOpType('INCREASE')}
            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition ${
              opType === 'INCREASE'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <ArrowDownToLine size={16} />
            <span>Increase</span>
          </button>
          <button
            type="button"
            onClick={() => setOpType('DECREASE')}
            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition ${
              opType === 'DECREASE'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <ArrowUpFromLine size={16} />
            <span>Deduct</span>
          </button>
          <button
            type="button"
            onClick={() => setOpType('TRANSFER')}
            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition ${
              opType === 'TRANSFER'
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <ArrowLeftRight size={16} />
            <span>Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => setOpType('ADJUST')}
            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition ${
              opType === 'ADJUST'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Adjust</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Product Selector */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name} (Stock: {p.currentStock} {p.uom})
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {opType === 'TRANSFER' ? 'Source Warehouse' : 'Warehouse'}
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {opType === 'TRANSFER' ? 'Source Location' : 'Location'}
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
              >
                {locations
                  .filter((l) => l.warehouseId === warehouseId)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.code} ({l.name})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Target for Transfers */}
          {opType === 'TRANSFER' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
              <div>
                <label className="block text-indigo-300 font-medium mb-1">Destination Warehouse</label>
                <select
                  value={targetWarehouseId}
                  onChange={(e) => setTargetWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-indigo-300 font-medium mb-1">Destination Location</label>
                <select
                  value={targetLocationId}
                  onChange={(e) => setTargetLocationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500"
                >
                  {locations
                    .filter((l) => l.warehouseId === targetWarehouseId)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code} ({l.name})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Quantity or Counted */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {opType === 'ADJUST' ? 'New Counted Physical Units' : 'Quantity Units'}
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            {opType === 'ADJUST' ? (
              <div>
                <label className="block text-slate-300 font-medium mb-1">Adjustment Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                >
                  <option value="CYCLE_COUNT">Cycle Count</option>
                  <option value="DAMAGED">Damaged Goods</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="THEFT">Loss / Theft</option>
                  <option value="DATA_CORRECTION">Data Correction</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-slate-300 font-medium mb-1">Audit Notes</label>
                <input
                  type="text"
                  placeholder="e.g. PO batch verification"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Commit Transaction to Ledger
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
