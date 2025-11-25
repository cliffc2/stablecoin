// src/components/TransferForm.tsx
import React, { useState } from 'react';
import { useTransfer } from '../hooks/useStablecoin';
import { TransferRequest } from '../types/stablecoin';
import { Send, Loader2 } from 'lucide-react';

interface TransferFormProps {
  walletAddress: string;
  balance: number;
}

const TransferForm: React.FC<TransferFormProps> = ({ walletAddress, balance }) => {
  const [formData, setFormData] = useState({
    toAddress: '',
    amount: '',
    reference: '',
    purpose: ''
  });

  const transferMutation = useTransfer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transferRequest: TransferRequest = {
      fromAddress: walletAddress,
      toAddress: formData.toAddress,
      amount: parseFloat(formData.amount),
      metadata: {
        reference: formData.reference || undefined,
        purpose: formData.purpose || undefined
      }
    };

    transferMutation.mutate(transferRequest);
  };

  const isAmountValid = parseFloat(formData.amount) > 0 && parseFloat(formData.amount) <= balance;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Transfer HKD</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700">
            Recipient Address
          </label>
          <input
            type="text"
            id="toAddress"
            value={formData.toAddress}
            onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            placeholder="Enter wallet address"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (HKD)
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            max={balance}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Available: {new Intl.NumberFormat('zh-HK', { style: 'currency', currency: 'HKD' }).format(balance)}
          </p>
        </div>

        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
            Reference (Optional)
          </label>
          <input
            type="text"
            id="reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            placeholder="Payment reference"
          />
        </div>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Purpose (Optional)
          </label>
          <select
            id="purpose"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          >
            <option value="">Select purpose</option>
            <option value="salary">Salary Payment</option>
            <option value="investment">Investment</option>
            <option value="trade_settlement">Trade Settlement</option>
            <option value="remittance">Remittance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!isAmountValid || transferMutation.isLoading}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {transferMutation.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Transfer
        </button>
      </form>
    </div>
  );
};

export default TransferForm;
