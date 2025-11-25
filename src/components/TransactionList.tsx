// src/components/TransactionList.tsx
import React from 'react';
import { Transaction } from '../types/stablecoin';
import { formatHKD, formatDate, getTransactionColor, getStatusColor, truncateAddress } from '../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Plus, Minus, Shield } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, isLoading }) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'MINT':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'BURN':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'TRANSFER':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      case 'FREEZE':
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {transactions?.map((transaction) => (
          <div key={transaction.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.transactionType)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {transaction.transactionType.toLowerCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    From: {truncateAddress(transaction.fromAddress)}
                  </p>
                  <p className="text-sm text-gray-500">
                    To: {truncateAddress(transaction.toAddress)}
                  </p>
                  {transaction.metadata?.reference && (
                    <p className="text-xs text-gray-400">
                      Ref: {transaction.metadata.reference}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-sm font-semibold ${getTransactionColor(transaction.transactionType)}`}>
                  {transaction.transactionType === 'BURN' ? '-' : ''}
                  {formatHKD(transaction.amount)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(transaction.createdAt)}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {(!transactions || transactions.length === 0) && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
