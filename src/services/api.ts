// src/services/api.ts
import axios from 'axios';
import {
  Wallet,
  Transaction,
  Reserve,
  TransferRequest,
  MintRequest,
  BurnRequest,
  ApiResponse,
  ComplianceAlert
} from '../types/stablecoin';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const stablecoinApi = {
  // Wallet operations
  async getWallet(address: string): Promise<Wallet> {
    const response = await api.get<ApiResponse<Wallet>>(`/wallets/${address}`);
    return response.data.data;
  },

  async createWallet(kycData: any): Promise<Wallet> {
    const response = await api.post<ApiResponse<Wallet>>('/wallets', kycData);
    return response.data.data;
  },

  // Transaction operations
  async transfer(transferRequest: TransferRequest): Promise<Transaction> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions/transfer', transferRequest);
    return response.data.data;
  },

  async mint(mintRequest: MintRequest): Promise<Transaction> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions/mint', mintRequest);
    return response.data.data;
  },

  async burn(burnRequest: BurnRequest): Promise<Transaction> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions/burn', burnRequest);
    return response.data.data;
  },

  async getTransactions(address: string, limit = 50): Promise<Transaction[]> {
    const response = await api.get<ApiResponse<Transaction[]>>(
      `/transactions/${address}?limit=${limit}`
    );
    return response.data.data;
  },

  // Reserve operations
  async getReserve(): Promise<Reserve> {
    const response = await api.get<ApiResponse<Reserve>>('/reserve');
    return response.data.data;
  },

  // Compliance operations
  async getComplianceAlerts(): Promise<ComplianceAlert[]> {
    const response = await api.get<ApiResponse<ComplianceAlert[]>>('/compliance/alerts');
    return response.data.data;
  },

  async freezeWallet(address: string): Promise<void> {
    await api.post<ApiResponse<void>>(`/compliance/freeze/${address}`);
  },

  async unfreezeWallet(address: string): Promise<void> {
    await api.post<ApiResponse<void>>(`/compliance/unfreeze/${address}`);
  }
};

export default api;
