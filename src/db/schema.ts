import Dexie from 'dexie';

// Base interfaces
export interface Supplier {
  id?: number;
  name: string;
  contact: string;
  licenseNumber: string;
}

export interface PurchaseOrder {
  id?: number;
  poNumber: string;
  supplierId: number;
  date: Date;
  weight: number;
  pricePerKg: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface RawMaterial {
  id?: number;
  supplierId: number;
  purchaseOrderId: number;
  weight: number;
  photoUrl: string;
  date: Date;
  lotNumber: string | null;
  status: 'pending' | 'assigned';
}

export interface DepurationData {
  status: 'pending' | 'in-progress' | 'completed';
  tankNumber: string;
  startTime: string;
  startReadings: {
    temperature: string;
    salinity: string;
  };
  endReadings?: {
    temperature: string;
    salinity: string;
  };
  completedAt?: string;
  duration: number;
}

export interface Lot {
  id?: number;
  lotNumber: string;
  receiptIds: number[];
  totalWeight: number;
  notes?: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
  depurationData?: DepurationData;
}

export interface ProcessingBatch {
  id?: number;
  lotNumber: string;
  shellOnWeight: number;
  meatWeight: number;
  boxes: Array<{
    type: 'shell-on' | 'meat';
    weight: number;
    boxNumber: string;
    grade: string;
  }>;
  date: Date;
  yieldPercentage: number;
  status: 'pending' | 'completed';
}

export interface ShellWeight {
  id?: number;
  weight: number;
  date: Date;
  createdAt: Date;
  notes?: string;
}

export interface Package {
  id?: number;
  lotNumber: string;
  type: 'shell-on' | 'meat';
  weight: number;
  boxNumber: string;
  grade: string;
  qrCode: string;
  date: Date;
}

export interface ProductGrade {
  id?: number;
  code: string;
  name: string;
  description: string;
  productType: 'shell-on' | 'meat';
}

class ClamFlowDB extends Dexie {
  suppliers!: Dexie.Table<Supplier, number>;
  purchaseOrders!: Dexie.Table<PurchaseOrder, number>;
  rawMaterials!: Dexie.Table<RawMaterial, number>;
  lots!: Dexie.Table<Lot, number>;
  processingBatches!: Dexie.Table<ProcessingBatch, number>;
  shellWeights!: Dexie.Table<ShellWeight, number>;
  packages!: Dexie.Table<Package, number>;
  productGrades!: Dexie.Table<ProductGrade, number>;

  constructor() {
    super('ClamFlowDB');
    this.version(1).stores({
      suppliers: '++id',
      purchaseOrders: '++id, supplierId',
      rawMaterials: '++id, supplierId, purchaseOrderId, lotNumber',
      lots: '++id, lotNumber',
      processingBatches: '++id, lotNumber',
      shellWeights: '++id',
      packages: '++id, lotNumber, boxNumber',
      productGrades: '++id, code'
    });
  }
}

export const db = new ClamFlowDB();