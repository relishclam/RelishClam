import React, { useState } from 'react';
import { Scale, Shell, Fish, Plus, Trash2 } from 'lucide-react';

interface BoxEntry {
  id: string;
  type: 'shell-on' | 'meat';
  weight: string;
  boxNumber: string;
  grade: string;
}

interface ProcessingData {
  lotNumber: string;
  boxes: BoxEntry[];
}

export default function Processing() {
  const [formData, setFormData] = useState<ProcessingData>({
    lotNumber: '',
    boxes: []
  });

  // Mock data for lots - replace with actual data from your database
  const availableLots = [
    { id: 'L240115001', label: 'L240115001 - Supplier 1' },
    { id: 'L240115002', label: 'L240115002 - Supplier 2' }
  ];

  const addBox = (type: 'shell-on' | 'meat') => {
    const newBox: BoxEntry = {
      id: crypto.randomUUID(),
      type,
      weight: '',
      boxNumber: generateBoxNumber(type),
      grade: ''
    };
    setFormData(prev => ({
      ...prev,
      boxes: [...prev.boxes, newBox]
    }));
  };

  const generateBoxNumber = (type: 'shell-on' | 'meat') => {
    const prefix = type === 'shell-on' ? 'SO' : 'CM';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  };

  const removeBox = (id: string) => {
    setFormData(prev => ({
      ...prev,
      boxes: prev.boxes.filter(box => box.id !== id)
    }));
  };

  const updateBox = (id: string, field: keyof BoxEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      boxes: prev.boxes.map(box =>
        box.id === id ? { ...box, [field]: value } : box
      )
    }));
  };

  const calculateTotalWeight = (type: 'shell-on' | 'meat') => {
    return formData.boxes
      .filter(box => box.type === type)
      .reduce((sum, box) => sum + (parseFloat(box.weight) || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Processing data:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Processing Data</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Lot
          </label>
          <select
            value={formData.lotNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select a lot</option>
            {availableLots.map(lot => (
              <option key={lot.id} value={lot.id}>{lot.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Product Boxes</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => addBox('shell-on')}
                className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
              >
                <Shell className="h-4 w-4" />
                <span>Add Shell-on Box</span>
              </button>
              <button
                type="button"
                onClick={() => addBox('meat')}
                className="flex items-center space-x-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <Fish className="h-4 w-4" />
                <span>Add Meat Box</span>
              </button>
            </div>
          </div>

          {formData.boxes.map(box => (
            <div
              key={box.id}
              className={`p-4 rounded-lg border ${
                box.type === 'shell-on' ? 'border-green-200' : 'border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {box.type === 'shell-on' ? (
                    <Shell className="h-5 w-5 text-green-600" />
                  ) : (
                    <Fish className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {box.type === 'shell-on' ? 'Shell-on Box' : 'Meat Box'}
                  </span>
                  <span className="text-sm text-gray-500">#{box.boxNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeBox(box.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={box.weight}
                    onChange={(e) => updateBox(box.id, 'weight', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <select
                    value={box.grade}
                    onChange={(e) => updateBox(box.id, 'grade', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600">Shell-on Total</div>
            <div className="text-lg font-medium">{calculateTotalWeight('shell-on').toFixed(1)} kg</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Meat Total</div>
            <div className="text-lg font-medium">{calculateTotalWeight('meat').toFixed(1)} kg</div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Submit Processing Data
        </button>
      </form>
    </div>
  );
}