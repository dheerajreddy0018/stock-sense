import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { COLLECTIONS } from '../../firebase/collections';
import { StockLedgerEntry } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { SearchInput } from '../../components/ui/Input';
import { History } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Stock Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audited transaction ledger reconciling balance changes across all facilities
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value)}
            className="px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Movement Types</option>
            <option value="OPENING_STOCK">Opening Balance</option>
            <option value="RECEIPT">Inward Receipts</option>
            <option value="DELIVERY">Outbound Deliveries</option>
            <option value="INTERNAL_TRANSFER_IN">Transfer In</option>
            <option value="INTERNAL_TRANSFER_OUT">Transfer Out</option>
            <option value="ADJUSTMENT_POSITIVE">Positive Adjustment (+)</option>
            <option value="ADJUSTMENT_NEGATIVE">Negative Adjustment (-)</option>
          </select>

          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Search SKU, reference, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="enterprise-card p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>SKU & Product</TableHead>
              <TableHead>Movement Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Delta</TableHead>
              <TableHead>Reconciliation Formula</TableHead>
              <TableHead>Reference & User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                  {formatDate(entry.timestamp)}
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 block">{entry.sku}</span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 block truncate max-w-xs">{entry.productName}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      entry.quantityDelta > 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                    }`}
                  >
                    {entry.movementType.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                  <div>{entry.warehouseName}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{entry.locationName}</div>
                </TableCell>
                <TableCell
                  className={`font-mono font-semibold text-sm ${
                    entry.quantityDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {entry.quantityDelta > 0 ? `+${entry.quantityDelta}` : entry.quantityDelta}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <span className="text-slate-400">{entry.balanceBefore}</span>
                  <span className="text-slate-400 mx-1">{entry.quantityDelta > 0 ? '+' : '−'}</span>
                  <span className={entry.quantityDelta > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'}>
                    {Math.abs(entry.quantityDelta)}
                  </span>
                  <span className="text-slate-400 mx-1">=</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">{entry.balanceAfter}</strong>
                </TableCell>
                <TableCell className="text-xs">
                  <span className="font-mono text-slate-800 dark:text-slate-200 block font-medium">{entry.referenceId}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{entry.performedByName}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
