import React from 'react';
import { Waves, Shell, Scale, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Waves className="h-8 w-8 text-blue-500" />}
          title="Daily Intake"
          value="2,450 kg"
          change="+12%"
        />
        <StatCard
          icon={<Shell className="h-8 w-8 text-emerald-500" />}
          title="Shell-on Stock"
          value="3,200 kg"
          change="-5%"
        />
        <StatCard
          icon={<Scale className="h-8 w-8 text-purple-500" />}
          title="Meat Yield"
          value="840 kg"
          change="+8%"
        />
        <StatCard
          icon={<TrendingUp className="h-8 w-8 text-amber-500" />}
          title="Processing Rate"
          value="92%"
          change="+3%"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessingQueue />
        <ActiveLots />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, change }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
}) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className={`text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ProcessingQueue() {
  const queue = [
    { id: 'PO-001', supplier: 'John\'s Fishing Co', quantity: '450kg', status: 'receiving' },
    { id: 'PO-002', supplier: 'Sea Harvest Ltd', quantity: '320kg', status: 'weighing' },
    { id: 'PO-003', supplier: 'Bay Clams Inc', quantity: '580kg', status: 'pending' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Processing Queue</h2>
      <div className="divide-y divide-gray-100">
        {queue.map((item) => (
          <div key={item.id} className="py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{item.id}</p>
              <p className="text-sm text-gray-500">{item.supplier}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{item.quantity}</p>
              <p className="text-sm text-blue-500 capitalize">{item.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveLots() {
  const lots = [
    { id: 'L-001', type: 'Shell-on', progress: 75 },
    { id: 'L-002', type: 'Meat', progress: 45 },
    { id: 'L-003', type: 'Shell-on', progress: 90 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Active Lots</h2>
      <div className="space-y-4">
        {lots.map((lot) => (
          <div key={lot.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{lot.id}</p>
                <p className="text-sm text-gray-500">{lot.type}</p>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {lot.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${lot.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}