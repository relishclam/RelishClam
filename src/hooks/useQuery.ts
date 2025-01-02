import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/setup';
import { PurchaseOrder, Lot, Package } from '../types';

export function useFishermen() {
  return useLiveQuery(() => db.suppliers.toArray());
}

export function useRawMaterials() {
  return useLiveQuery(() => db.rawMaterials.toArray());
}

export function useProcessingBatches() {
  return useLiveQuery(() => db.processingBatches.toArray());
}

export function usePackages() {
  return useLiveQuery(() => db.packages.toArray());
}

export function useLotNumbers() {
  return useLiveQuery(() => 
    db.rawMaterials
      .orderBy('lotNumber')
      .uniqueKeys()
  );
}

export const usePurchaseOrders = () => {
  return useLiveQuery(() => db.purchaseOrders.toArray());
};

export const useLots = () => {
  return useLiveQuery(() => db.lots.toArray());
};

export const useProducts = () => {
  return useLiveQuery(() => db.packages.toArray());
};