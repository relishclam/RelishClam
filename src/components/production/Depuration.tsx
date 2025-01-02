import React, { useState } from 'react';
import { Clock, Thermometer, Droplets } from 'lucide-react';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { useNotification } from '../../hooks/useNotification';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface DepurationReadings {
  temperature: string;
  salinity: string;
}

interface DepurationData {
  status: 'pending' | 'in-progress' | 'completed';
  tankNumber: string;
  startTime: string;
  startReadings: DepurationReadings;
  endReadings?: DepurationReadings;
  completedAt?: string;
  duration: number;
}

interface Lot {
  id?: number;
  lotNumber: string;
  status: string;
  depurationData?: DepurationData;
}

export default function Depuration({ lotNumber }: { lotNumber: string }) {
  const [formData, setFormData] = useState({
    tankNumber: '',
    temperature: '',
    salinity: ''
  });

  const { addNotification } = useNotification();

  // Get current depuration status for this lot
  const lot = useLiveQuery(async () => {
    return await db.lots.where('lotNumber').equals(lotNumber).first();
  }, [lotNumber]);

  const isDepurationStarted = lot?.depurationData?.status === 'in-progress';
  const isDepurationCompleted = lot?.depurationData?.status === 'completed';
  const depurationStartTime = lot?.depurationData?.startTime ? new Date(lot.depurationData.startTime) : null;

  const calculateElapsedTime = () => {
    if (!depurationStartTime) return null;
    const now = new Date();
    const hours = differenceInHours(now, depurationStartTime);
    const minutes = differenceInMinutes(now, depurationStartTime) % 60;
    return { hours, minutes };
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tankNumber || !formData.temperature || !formData.salinity) {
      addNotification('error', 'Please fill in all required fields');
      return;
    }

    try {
      await db.lots.where('lotNumber').equals(lotNumber).modify(lot => {
        lot.depurationData = {
          status: 'in-progress',
          tankNumber: formData.tankNumber,
          startTime: new Date().toISOString(),
          startReadings: {
            temperature: formData.temperature,
            salinity: formData.salinity
          },
          duration: 0
        };
      });

      addNotification('success', 'Depuration process started');
    } catch (error) {
      console.error('Error starting depuration:', error);
      addNotification('error', 'Error starting depuration process');
    }
  };

  const handleComplete = async () => {
    try {
      const elapsedTime = calculateElapsedTime();
      if (!elapsedTime) {
        throw new Error('Could not calculate elapsed time');
      }

      await db.lots.where('lotNumber').equals(lotNumber).modify(lot => {
        if (lot.depurationData) {
          lot.depurationData.status = 'completed';
          lot.depurationData.completedAt = new Date().toISOString();
          lot.depurationData.endReadings = {
            temperature: formData.temperature,
            salinity: formData.salinity
          };
          lot.depurationData.duration = elapsedTime.hours;
        }
      });

      addNotification('success', 'Depuration process completed');
    } catch (error) {
      console.error('Error completing depuration:', error);
      addNotification('error', 'Error completing depuration process');
    }
  };

  const elapsedTime = calculateElapsedTime();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Depuration Process</h2>
        <p className="text-sm text-gray-600 mt-1">Lot Number: {lotNumber}</p>
      </div>

      {isDepurationCompleted ? (
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-900">Depuration Completed</h3>
              <p className="mt-1 text-sm text-green-700">
                Duration: {lot?.depurationData?.duration} hours
              </p>
            </div>
          </div>
        </div>
      ) : isDepurationStarted ? (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-blue-900">Depuration in Progress</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Started: {depurationStartTime?.toLocaleString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm text-gray-600">Tank Number</div>
                <div className="font-medium">{lot?.depurationData?.tankNumber}</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm text-gray-600">Elapsed Time</div>
                <div className="font-medium">
                  {elapsedTime ? `${elapsedTime.hours}h ${elapsedTime.minutes}m` : 'Calculating...'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm text-gray-600">Initial Temperature</div>
                <div className="font-medium">
                  {lot?.depurationData?.startReadings?.temperature}°C
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm text-gray-600">Initial Salinity</div>
                <div className="font-medium">
                  {lot?.depurationData?.startReadings?.salinity} ppt
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Final Readings</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Temperature (°C)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Thermometer className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                    step="0.1"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Salinity (ppt)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Droplets className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.salinity}
                    onChange={(e) => setFormData(prev => ({ ...prev, salinity: e.target.value }))}
                    step="0.1"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Complete Depuration
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tank Number
            </label>
            <input
              type="text"
              value={formData.tankNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, tankNumber: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Temperature (°C)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Thermometer className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                  step="0.1"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Salinity (ppt)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Droplets className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={formData.salinity}
                  onChange={(e) => setFormData(prev => ({ ...prev, salinity: e.target.value }))}
                  step="0.1"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Start Depuration
          </button>
        </form>
      )}
    </div>
  );
}