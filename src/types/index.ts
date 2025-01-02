export interface Supplier {
  id: number;
  name: string;
  contact: string;
  licenseNumber: string;
}

export interface PurchaseOrder {
  id: number;
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
  id: number;
  supplierId: number;
  purchaseOrderId: number;
  weight: number;
  photoUrl: string;
  date: Date;
  status: 'pending' | 'assigned';
  lotNumber: string | null;
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
  id: number;
  lotNumber: string;
  receiptIds: number[];
  totalWeight: number;
  notes?: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
  depurationData?: DepurationData;
}

export interface ProcessingBatch {
  id: number;
  lotNumber: string;
  shellOnWeight: number;
  meatWeight: number;
  boxes: {
    type: 'shell-on' | 'meat';
    weight: number;
    boxNumber: string;
    grade: string;
  }[];
  status: 'pending' | 'completed';
  yieldPercentage: number;
  date: Date;
}

export interface Package {
  id: number;
  lotNumber: string;
  type: 'shell-on' | 'meat';
  weight: number;
  boxNumber: string;
  grade: string;
  qrCode: string;
  date: Date;
}

export interface ProductGrade {
  id: number;
  code: string;
  name: string;
  description: string;
  productType: 'shell-on' | 'meat';
}

export interface Receipt {
  id: string;
  weight: number;
  supplierName: string;
}

export interface PackagedProduct {
  id: string;
  lotNumber: string;
  boxNumber: string;
  productType: 'shell-on' | 'meat';
  weight: number;
  packingDate: string;
}

export interface Product {
  id: number;
  lotId: number;
  type: 'shell-on' | 'meat';
  grade: string;
}

export type ViewType = 'dashboard' | 'rawMaterial' | 'processing' | 'packaging' | 'inventory' | 'admin';