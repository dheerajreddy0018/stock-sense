import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { COLLECTIONS } from '../../firebase/collections';
import { Product } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Package, Eye } from 'lucide-react';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import { InventoryStory } from '../inventory/InventoryStory';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    return dbService.subscribe<Product>(COLLECTIONS.PRODUCTS, setProducts);
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Products & Catalog
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master item catalog, cost valuations, on-hand balances, and replenishment thresholds
          </p>
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search by name, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="enterprise-card p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Cost / Sale</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Alert Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {prod.sku}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white block">{prod.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs block">
                    {prod.description}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {prod.categoryName}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <div className="text-slate-900 dark:text-slate-100 font-medium">{formatCurrency(prod.costPrice)}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px]">{formatCurrency(prod.sellingPrice)} sell</div>
                </TableCell>
                <TableCell className="font-mono font-semibold text-slate-900 dark:text-white">
                  {formatQuantity(prod.currentStock, prod.uom)}
                </TableCell>
                <TableCell className="font-mono text-slate-500 dark:text-slate-400 text-xs">
                  min: {prod.minStockAlert}
                </TableCell>
                <TableCell>
                  {prod.currentStock === 0 ? (
                    <Badge variant="danger" dot>Out of Stock</Badge>
                  ) : prod.currentStock <= prod.minStockAlert ? (
                    <Badge variant="warning" dot>Low Stock</Badge>
                  ) : (
                    <Badge variant="success" dot>Optimal</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs"
                    title="View Lifecycle"
                  >
                    <Eye size={13} />
                    <span>Lifecycle</span>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Selected Product Inventory Story Modal */}
      {selectedProduct && (
        <Modal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          title={`Inventory Lifecycle: ${selectedProduct.name}`}
          description={`Audited ledger movements for SKU ${selectedProduct.sku}`}
          maxWidth="xl"
        >
          <InventoryStory product={selectedProduct} />
        </Modal>
      )}
    </div>
  );
};
