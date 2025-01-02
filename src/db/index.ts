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
} from './schema';

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

  async initializeDatabase() {
    const supplierCount = await this.suppliers.count();
    const gradeCount = await this.productGrades.count();

    if (supplierCount === 0) {
      await this.suppliers.bulkAdd([
        { name: "Ocean Fresh Clams", contact: "555-0101", licenseNumber: "LIC001" },
        { name: "Bay Area Seafood", contact: "555-0102", licenseNumber: "LIC002" },
        { name: "Coastal Harvest", contact: "555-0103", licenseNumber: "LIC003" }
      ]);
    }

    if (gradeCount === 0) {
      await this.productGrades.bulkAdd([
        {
          code: 'A',
          name: 'Premium',
          description: 'Highest quality, uniform size, perfect condition',
          productType: 'shell-on'
        },
        {
          code: 'B',
          name: 'Standard',
          description: 'Good quality, minor variations allowed',
          productType: 'shell-on'
        },
        {
          code: 'A',
          name: 'Premium',
          description: 'Clean, white meat, no impurities',
          productType: 'meat'
        },
        {
          code: 'B',
          name: 'Standard',
          description: 'Good quality meat, slight color variations allowed',
          productType: 'meat'
        }
      ]);
    }
  }
}

// Create database instance
export const db = new ClamFlowDB();

// Initialize database
db.open()
  .then(() => db.initializeDatabase())
  .catch(error => {
    console.error('Failed to open database:', error);
    // If version error, delete and recreate
    if (error.name === 'VersionError') {
      db.delete().then(() => {
        console.log('Database deleted due to version mismatch');
        window.location.reload();
      });
    }
  });

export * from './setup';
export * from '../types';