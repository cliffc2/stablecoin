// src/utils/formatters.ts
export const formatHKD = (amount: number): string => {
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-HK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateAddress = (address: string, start = 6, end = 4): string => {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const getTransactionColor = (type: string): string => {
  switch (type) {
    case 'MINT':
      return 'text-green-600';
    case 'BURN':
      return 'text-red-600';
    case 'TRANSFER':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'FROZEN':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
