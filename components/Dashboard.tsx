// src/components/Dashboard.tsx
import React from 'react';
import { useWallet, useReserve, useComplianceAlerts } from '../hooks/useStablecoin';
import { formatHKD, formatDate } from '../utils/formatters';
import { Wallet, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

interface DashboardProps {
  walletAddress: string;
}

const Dashboard: React.FC<DashboardProps> = ({ walletAddress }) => {
  const { data: wallet, isLoading: walletLoading } = useWallet(walletAddress);
  const { data: reserve, isLoading: reserveLoading } = useReserve();
  const { data: alerts } = useComplianceAlerts();

  const criticalAlerts = alerts?.filter(alert => 
    alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
  ).length || 0;

  if (walletLoading || reserveLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatHKD(wallet?.balance || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reserve Ratio</p>
              <p className="text-2xl font-bold text-gray-900">
                {reserve ? `${(reserve.reserveRatio * 100).toFixed(2)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">KYC Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {wallet?.kycStatus.toLowerCase().replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{criticalAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reserve Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Reserve Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total HKD in Circulation</p>
            <p className="text-xl font-semibold">
              {formatHKD(reserve?.hkdBalance || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Audit</p>
            <p className="text-xl font-semibold">
              {reserve ? formatDate(reserve.lastAudit) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reserve Status</p>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  (reserve?.reserveRatio || 0) >= 1 ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-xl font-semibold">
                {(reserve?.reserveRatio || 0) >= 1 ? 'Fully Backed' : 'Under-Backed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Reserve Asset Composition</h2>
        <div className="space-y-2">
          {reserve?.assets && Object.entries(reserve.assets).map(([asset, amount]) => (
            <div key={asset} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{asset}</span>
              <span className="text-sm font-semibold">{formatHKD(amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
