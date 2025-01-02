import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useLotNumbers } from '../hooks/useLotNumbers';

interface LotSelectorProps {
  value: string;
  onChange: (lotNumber: string) => void;
  status?: 'pending' | 'processing' | 'completed';
  requireDepuration?: boolean;
  className?: string;
  required?: boolean;
}

export default function LotSelector({ 
  value, 
  onChange, 
  status,
  requireDepuration = false,
  className = '',
  required = false 
}: LotSelectorProps) {
  const lots = useLotNumbers(status, requireDepuration);

  if (!lots) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg h-10"></div>
    );
  }

  if (lots.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          {requireDepuration ? (
            <>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Depuration Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete the depuration process for lots before proceeding to this step.
                </p>
              </div>
            </>
          ) : (
            <>
              <Package className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">No Lots Available</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {status === 'pending' 
                    ? 'Create new lots in Raw Material Management first.'
                    : 'No lots found with the specified status.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${className}`}
      required={required}
    >
      <option value="">Select a lot</option>
      {lots.map(lot => (
        <option key={lot.lotNumber} value={lot.lotNumber}>
          Lot {lot.lotNumber} - {lot.totalWeight.toFixed(1)} kg from {lot.suppliers.join(', ')} 
          ({format(new Date(lot.createdAt), 'dd MMM yyyy')})
          {lot.depurationStatus === 'completed' && 
            ` - Depuration Completed ${format(new Date(lot.depurationCompletedAt!), 'dd MMM HH:mm')}`}
        </option>
      ))}
    </select>
  );
}