import React, { useState } from 'react';
import { Package, Check, AlertTriangle, List, Plus } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { db } from '../../db';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';

type TabType = 'create' | 'view';

interface RawMaterialEntry {
  id: string;
  weight: number;
  date: string;
  supplierName: string;
}

export default function LotCreation() {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [lotNotes, setLotNotes] = useState('');
  const { addNotification } = useNotification();

  // Fetch unassigned raw materials
  const rawMaterialEntries = useLiveQuery(async () => {
    try {
      const materials = await db.rawMaterials
        .where('status')
        .equals('pending')
        .toArray();

      const suppliers = await db.suppliers.toArray();
      const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));

      return materials.map(material => ({
        id: material.id!.toString(),
        weight: material.weight,
        date: format(new Date(material.date), 'yyyy-MM-dd'),
        supplierName: supplierMap.get(material.supplierId) || 'Unknown Supplier'
      }));
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      return [];
    }
  }, []);

  // Fetch created lots
  const lots = useLiveQuery(async () => {
    try {
      const allLots = await db.lots.orderBy('createdAt').reverse().toArray();
      const materials = await db.rawMaterials.toArray();
      const suppliers = await db.suppliers.toArray();
      const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));

      return allLots.map(lot => {
        const lotMaterials = materials.filter(m => m.lotNumber === lot.lotNumber);
        const lotSuppliers = [...new Set(lotMaterials.map(m => 
          supplierMap.get(m.supplierId) || 'Unknown Supplier'
        ))];

        return {
          ...lot,
          suppliers: lotSuppliers,
          materialCount: lotMaterials.length
        };
      });
    } catch (error) {
      console.error('Error fetching lots:', error);
      return [];
    }
  }, []);

  const toggleEntry = (id: string) => {
    setSelectedEntries(prev =>
      prev.includes(id)
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEntries.length === 0) {
      addNotification('error', 'Please select at least one raw material entry');
      return;
    }

    try {
      // Generate lot number
      const lotNumber = `L${format(new Date(), 'yyMMddHHmm')}`;

      // Calculate total weight
      const selectedMaterials = rawMaterialEntries?.filter(entry =>
        selectedEntries.includes(entry.id)
      ) || [];
      const totalWeight = selectedMaterials.reduce((sum, entry) => sum + entry.weight, 0);

      // Create lot and update raw materials in a transaction
      await db.transaction('rw', [db.lots, db.rawMaterials], async () => {
        // Create lot
        await db.lots.add({
          lotNumber,
          receiptIds: selectedEntries.map(id => parseInt(id)),
          totalWeight,
          notes: lotNotes,
          status: 'pending',
          createdAt: new Date()
        });

        // Update raw materials
        await Promise.all(
          selectedEntries.map(id =>
            db.rawMaterials
              .where('id')
              .equals(parseInt(id))
              .modify({ lotNumber, status: 'assigned' })
          )
        );
      });

      addNotification('success', `Lot ${lotNumber} created successfully`);
      setSelectedEntries([]);
      setLotNotes('');
      setActiveTab('view'); // Switch to view tab after creation
    } catch (error) {
      console.error('Error creating lot:', error);
      addNotification('error', 'Error creating lot');
    }
  };

  if (!rawMaterialEntries || !lots) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-4 px-1 inline-flex items-center space-x-2 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>Create Lot</span>
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`py-4 px-1 inline-flex items-center space-x-2 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <List className="h-5 w-5" />
            <span>View Lots</span>
          </button>
        </nav>
      </div>

      {activeTab === 'create' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Raw Materials</h3>
            {rawMaterialEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Raw Materials Available</h3>
                <p className="text-gray-500 mt-2">Add raw materials first to create lots</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rawMaterialEntries.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => toggleEntry(entry.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer ${
                      selectedEntries.includes(entry.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{entry.supplierName}</div>
                        <div className="text-sm text-gray-500">{entry.weight} kg</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{entry.date}</span>
                        <div className={`p-2 rounded-full ${
                          selectedEntries.includes(entry.id)
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lot Notes (Optional)
            </label>
            <textarea
              value={lotNotes}
              onChange={(e) => setLotNotes(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Add any relevant notes about this lot..."
            />
          </div>

          {selectedEntries.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-blue-600">Selected Materials:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {selectedEntries.length} items
                  </span>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Total Weight:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {rawMaterialEntries
                      .filter(entry => selectedEntries.includes(entry.id))
                      .reduce((sum, entry) => sum + entry.weight, 0)
                      .toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedEntries.length === 0}
          >
            Create Lot
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Created Lots</h3>
          {lots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No lots have been created yet
            </div>
          ) : (
            lots.map(lot => (
              <div key={lot.lotNumber} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900">Lot {lot.lotNumber}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      From: {lot.suppliers.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {lot.totalWeight.toFixed(1)} kg
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(lot.createdAt), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {lot.materialCount} material entries
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    lot.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : lot.status === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lot.status.charAt(0).toUpperCase() + lot.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}