import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Lot } from '../db/schema';

export function useLots(status?: 'pending' | 'processing' | 'completed') {
  return useLiveQuery(async () => {
    let query = db.lots.orderBy('createdAt').reverse();
    
    if (status) {
      query = query.filter(lot => lot.status === status);
    }

    const lots = await query.toArray();
    const rawMaterials = await db.rawMaterials.toArray();
    const suppliers = await db.suppliers.toArray();
    const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));

    return lots.map(lot => {
      const lotMaterials = rawMaterials.filter(rm => rm.lotNumber === lot.lotNumber);
      const lotSuppliers = [...new Set(lotMaterials.map(rm => {
        const supplierName = supplierMap.get(rm.supplierId);
        return supplierName || 'Unknown Supplier';
      }))];

      return {
        ...lot,
        suppliers: lotSuppliers,
        materials: lotMaterials.map(rm => ({
          ...rm,
          supplierName: supplierMap.get(rm.supplierId) || 'Unknown Supplier'
        }))
      };
    });
  }, [status]);
}

export async function createLot(data: {
  receipts: number[];
  totalWeight: number;
  notes?: string;
}) {
  const lotNumber = generateLotNumber();
  
  return await db.transaction('rw', [db.lots, db.rawMaterials], async () => {
    // Create lot
    await db.lots.add({
      lotNumber,
      receiptIds: data.receipts,
      totalWeight: data.totalWeight,
      notes: data.notes,
      status: 'pending',
      createdAt: new Date()
    });

    // Update receipt statuses
    await Promise.all(
      data.receipts.map(id =>
        db.rawMaterials
          .where('id')
          .equals(id)
          .modify({ lotNumber, status: 'assigned' })
      )
    );

    return lotNumber;
  });
}

function generateLotNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `L${year}${month}${day}${random}`;
}