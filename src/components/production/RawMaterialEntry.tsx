import React, { useState } from 'react';
import { Scale, User, Calendar } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { generatePONumber } from '../../utils/generators';
import PhotoUpload from '../raw-material/PhotoUpload';

export default function RawMaterialEntry() {
  // Generate PO number once when component mounts
  const [poNumber] = useState(generatePONumber);
  
  const [formData, setFormData] = useState({
    supplierId: '',
    weight: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [photo, setPhoto] = useState<string | null>(null);

  const { addNotification } = useNotification();
  const suppliers = useLiveQuery(() => db.suppliers.toArray());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.weight || !photo) {
      addNotification('error', 'Please fill in all required fields');
      return;
    }

    try {
      await db.transaction('rw', [db.purchaseOrders, db.rawMaterials], async () => {
        // Create purchase order
        const orderId = await db.purchaseOrders.add({
          poNumber,
          supplierId: parseInt(formData.supplierId),
          date: new Date(formData.date),
          weight: parseFloat(formData.weight),
          pricePerKg: 0,
          totalAmount: 0,
          status: 'pending',
          createdAt: new Date()
        });

        // Create raw material entry
        await db.rawMaterials.add({
          supplierId: parseInt(formData.supplierId),
          purchaseOrderId: orderId,
          weight: parseFloat(formData.weight),
          photoUrl: photo,
          date: new Date(formData.date),
          status: 'pending',
          lotNumber: null
        });
      });

      addNotification('success', `Raw material entry created with PO: ${poNumber}`);
      // Reset form
      setFormData({
        supplierId: '',
        weight: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      setPhoto(null);
    } catch (error) {
      console.error('Error creating raw material entry:', error);
      addNotification('error', 'Error creating raw material entry');
    }
  };

  if (!suppliers) {
    return <div>Loading suppliers...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Raw Material Entry</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display auto-generated PO Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Order Number
          </label>
          <input
            type="text"
            value={poNumber}
            className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium"
            readOnly
          />
          <p className="mt-1 text-sm text-gray-500">Auto-generated PO number</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} - {supplier.licenseNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Scale className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              step="0.1"
              min="0"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight Photo
          </label>
          <PhotoUpload
            value={photo}
            onPhotoCapture={setPhoto}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Raw Material Entry
        </button>
      </form>
    </div>
  );
}