import Dexie from 'dexie';
import type { 
  Supplier, 
  RawMaterial, 
  Lot, 
  ProcessingBatch, 
  ShellWeight,
  Package,
  ProductGrade,
  PurchaseOrder 
} from '../types';

class ClamFlowDB extends Dexie {
  suppliers!: Dexie.Table<Supplier, number>;
  rawMaterials!: Dexie.Table<RawMaterial, number>;
  lots!: Dexie.Table<Lot, number>;
  processingBatches!: Dexie.Table<ProcessingBatch, number>;
  shellWeights!: Dexie.Table<ShellWeight, number>;
  packages!: Dexie.Table<Package, number>;
  productGrades!: Dexie.Table<ProductGrade, number>;
  purchaseOrders!: Dexie.Table<PurchaseOrder, number>;

  constructor() {
    super('ClamFlowDB');

    this.version(1).stores({
      suppliers: '++id, name, licenseNumber',
      rawMaterials: '++id, supplierId, lotNumber, status, date',
      lots: '++id, lotNumber, status, createdAt',
      processingBatches: '++id, lotNumber, status, date',
      shellWeights: '++id, date, createdAt',
      packages: '++id, lotNumber, boxNumber, date',
      productGrades: '++id, code, productType',
      purchaseOrders: '++id, poNumber, supplierId, status, date'
    });

    // Add hooks for date conversion
    this.rawMaterials.hook('reading', obj => ({
      ...obj,
      date: obj.date instanceof Date ? obj.date : new Date(obj.date)
    }));

    this.lots.hook('reading', obj => ({
      ...obj,
      createdAt: obj.createdAt instanceof Date ? obj.createdAt : new Date(obj.createdAt)
    }));

    this.processingBatches.hook('reading', obj => ({
      ...obj,
      date: obj.date instanceof Date ? obj.date : new Date(obj.date)
    }));

    this.shellWeights.hook('reading', obj => ({
      ...obj,
      date: obj.date instanceof Date ? obj.date : new Date(obj.date),
      createdAt: obj.createdAt instanceof Date ? obj.createdAt : new Date(obj.createdAt)
    }));

    this.packages.hook('reading', obj => ({
      ...obj,
      date: obj.date instanceof Date ? obj.date : new Date(obj.date)
    }));

    this.purchaseOrders.hook('reading', obj => ({
      ...obj,
      date: obj.date instanceof Date ? obj.date : new Date(obj.date),
      createdAt: obj.createdAt instanceof Date ? obj.createdAt : new Date(obj.createdAt)
    }));
  }

  async clearAllTables() {
    await Promise.all([
      this.suppliers.clear(),
      this.rawMaterials.clear(),
      this.lots.clear(),
      this.processingBatches.clear(),
      this.shellWeights.clear(),
      this.packages.clear(),
      this.productGrades.clear(),
      this.purchaseOrders.clear()
    ]);
  }
}

// Create and export database instance
export const db = new ClamFlowDB();