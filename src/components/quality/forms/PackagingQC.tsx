import React, { useState } from 'react';
import { Check, X, AlertTriangle, Tag } from 'lucide-react';
import { useNotification } from '../../../hooks/useNotification';
import { db } from '../../../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface PackagingQCProps {
  lotNumber: string;
}

export default function PackagingQC({ lotNumber }: PackagingQCProps) {
  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Package Integrity', passed: null, notes: '' },
    { id: '2', label: 'Label Accuracy', passed: null, notes: '' },
    { id: '3', label: 'Weight Verification', passed: null, notes: '' },
    { id: '4', label: 'Product Temperature', passed: null, notes: '' },
    { id: '5', label: 'QR Code Readability', passed: null, notes: '' },
    { id: '6', label: 'Product Grade Verification', passed: null, notes: '' }
  ]);

  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]);
  const boxes = useLiveQuery(() => 
    db.packages
      .where('lotNumber')
      .equals(lotNumber)
      .toArray()
  );

  const { addNotification } = useNotification();

  const handleCheck = (id: string, passed: boolean) => {
    setChecklist(items =>
      items.map(item =>
        item.id === id ? { ...item, passed } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checklist.some(item => item.passed === null)) {
      addNotification('error', 'Please complete all quality checks');
      return;
    }

    if (selectedBoxes.length === 0) {
      addNotification('error', 'Please select at least one box for QC');
      return;
    }

    try {
      await db.transaction('rw', [db.lots, db.packages], async () => {
        const lot = await db.lots.where('lotNumber').equals(lotNumber).first();
        if (!lot) throw new Error('Lot not found');

        // Update lot with QC results
        await db.lots.update(lot.id!, {
          packagingQC: {
            checklist,
            inspectedBoxes: selectedBoxes,
            completedAt: new Date(),
            passed: checklist.every(item => item.passed)
          }
        });

        // Update inspected boxes
        await Promise.all(
          selectedBoxes.map(boxNumber =>
            db.packages
              .where('boxNumber')
              .equals(boxNumber)
              .modify({ qcInspected: true, qcPassed: checklist.every(item => item.passed) })
          )
        );
      });

      addNotification('success', 'Packaging quality control completed');
    } catch (error) {
      console.error('Error saving QC results:', error);
      addNotification('error', 'Error saving quality control results');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Select Boxes for Inspection</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boxes?.map(box => (
              <div
                key={box.boxNumber}
                className={`p-4 rounded-lg border-2 cursor-pointer ${
                  selectedBoxes.includes(box.boxNumber)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => {
                  setSelectedBoxes(prev =>
                    prev.includes(box.boxNumber)
                      ? prev.filter(b => b !== box.boxNumber)
                      : [...prev, box.boxNumber]
                  );
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Box #{box.boxNumber}</div>
                    <div className="text-sm text-gray-500">{box.type}</div>
                  </div>
                  <Tag className={`h-5 w-5 ${
                    selectedBoxes.includes(box.boxNumber)
                      ? 'text-blue-500'
                      : 'text-gray-400'
                  }`} />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {box.weight} kg - Grade {box.grade}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {checklist.map((item) => (
          <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{item.label}</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleCheck(item.id, true)}
                  className={`p-2 rounded-full ${
                    item.passed === true
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCheck(item.id, false)}
                  className={`p-2 rounded-full ${
                    item.passed === false
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {checklist.some(item => item.passed === false) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Some quality checks have failed. Review packaging and take corrective actions.</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={selectedBoxes.length === 0}
      >
        Submit Packaging QC Results
      </button>
    </form>
  );
}