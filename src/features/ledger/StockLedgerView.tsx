import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { COLLECTIONS } from '../../firebase/collections';
import { StockLedgerEntry } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/Input';
import { History, Info } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const StockLedgerView: React.FC = () => {
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);
  const [search, setSearch] = useState('');
  const [movementFilter, setMovementFilter] = useState<string>('ALL');

  useEffect(() => {
    return dbService.subscribe<StockLedgerEntry>(COLLECTIONS.STOCK_LEDGER, (all) => {
      setEntries([...all].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    });
  }, []);

  const filtered = entries.filter((e) => {
    const matchesSearch =
      e.productName.toLowerCase().includes(search.toLowerCase()) ||
      e.sku.toLowerCase().includes(search.toLowerCase()) ||
      e.referenceId.toLowerCase().includes(search.toLowerCase()) ||
      e.performedByName.toLowerCase().includes(search.toLowerCase());

    const matchesType = movementFilter === 'ALL' || e.movementType === movementFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Immutable Stock Ledger
            </h1>
            <Badge variant="success" size="sm">
              Member 4 Module
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic audit trail of all physical and virtual inventory movements
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none"
          >
            <option value="ALL">All Movement Types</option>
            <option value="OPENING_STOCK">Opening Baseline</option>
            <option value="RECEIPT">Inward Receipts</option>
            <option value="DELIVERY">Outbound Deliveries</option>
            <option value="INTERNAL_TRANSFER_IN">Transfer Inbound</option>
            <option value="INTERNAL_TRANSFER_OUT">Transfer Outbound</option>
            <option value="ADJUSTMENT_POSITIVE">Positive Adjustment (+)</option>
            <option value="ADJUSTMENT_NEGATIVE">Negative Adjustment (-)</option>
          </select>

          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Filter by SKU, PO#, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="text-slate-200">Integration Notice for Member 4 (Ledger):</strong> Entries in this collection are strictly append-only. The current balance of any SKU equals the cumulative sum of all <code className="font-mono text-emerald-400">quantityDelta</code> values since inception.
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>SKU & Product</TableHead>
              <TableHead>Movement Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Delta</TableHead>
              <TableHead>Formula Reconciliation</TableHead>
              <TableHead>Reference & Operator</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-slate-400 text-xs whitespace-nowrap">
                  {formatDate(entry.timestamp)}
                </TableCell>
                <TableCell>
                  <span className="font-mono font-bold text-emerald-400 block">{entry.sku}</span>
                  <span className="text-[11px] text-slate-300 block truncate max-w-xs">{entry.productName}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      entry.quantityDelta > 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {entry.movementType.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-300">
                  <div>{entry.warehouseName}</div>
                  <div className="text-[11px] text-slate-400">{entry.locationName}</div>
                </TableCell>
                <TableCell
                  className={`font-mono font-bold text-sm ${
                    entry.quantityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {entry.quantityDelta > 0 ? `+${entry.quantityDelta}` : entry.quantityDelta}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <span className="text-slate-400">{entry.balanceBefore}</span>
                  <span className="text-slate-500 mx-1">{entry.quantityDelta > 0 ? '+' : '−'}</span>
                  <span className={entry.quantityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {Math.abs(entry.quantityDelta)}
                  </span>
                  <span className="text-slate-500 mx-1">=</span>
                  <strong className="text-white font-bold">{entry.balanceAfter}</strong>
                </TableCell>
                <TableCell className="text-xs">
                  <span className="font-mono text-cyan-400 block font-medium">{entry.referenceId}</span>
                  <span className="text-[11px] text-slate-400 block">{entry.performedByName}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
