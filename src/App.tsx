// src/App.tsx
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import TransferForm from './components/TransferForm';
import TransactionList from './components/TransactionList';
import { useWallet, useTransactions } from './hooks/useStablecoin';
import { Wallet, Send, History, Settings } from 'lucide-react';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <HKDStablecoinApp />
    </QueryClientProvider>
  );
}

const HKDStablecoinApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transfer' | 'transactions'>('dashboard');
  const [walletAddress] = useState('user_xyz789'); // In real app, this would come from auth

  const { data: wallet } = useWallet(walletAddress);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(walletAddress);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">HKD Stablecoin</h1>
              </div>
              <nav className="ml-8 flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'transfer'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Transfer
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'transactions'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <History className="h-4 w-4 mr-2" />
                  Transactions
                </button>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{walletAddress}</p>
                <p className="text-sm text-gray-500">
                  Balance: {new Intl.NumberFormat('zh-HK', { style: 'currency', currency: 'HKD' }).format(wallet?.balance || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'dashboard' && (
            <Dashboard walletAddress={walletAddress} />
          )}
          
          {activeTab === 'transfer' && wallet && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TransferForm 
                  walletAddress={walletAddress} 
                  balance={wallet.balance} 
                />
              </div>
              <div className="lg:col-span-2">
                <TransactionList 
                  transactions={transactions || []} 
                  isLoading={transactionsLoading} 
                />
              </div>
            </div>
          )}
          
          {activeTab === 'transactions' && (
            <TransactionList 
              transactions={transactions || []} 
              isLoading={transactionsLoading} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
