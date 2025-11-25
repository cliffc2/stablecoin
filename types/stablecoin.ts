// src/types/stablecoin.ts
export interface Wallet {
  address: string;
  balance: number;
  frozen: boolean;
  kycStatus: KycStatus;
  createdAt: string;
}

export enum KycStatus {
  Pending = 'PENDING',
  Verified = 'VERIFIED',
  Rejected = 'REJECTED',
  EnhancedVerified = 'ENHANCED_VERIFIED'
}

export interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  metadata?: TransactionMetadata;
}

export enum TransactionType {
  Transfer = 'TRANSFER',
  Mint = 'MINT',
  Burn = 'BURN',
  Freeze = 'FREEZE',
  Unfreeze = 'UNFREEZE'
}

export enum TransactionStatus {
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Frozen = 'FROZEN'
}

export interface TransactionMetadata {
  reference?: string;
  purpose?: string;
  regulatoryApprovalId?: string;
}

export interface Reserve {
  hkdBalance: number;
  assets: Record<string, number>;
  lastAudit: string;
  reserveRatio: number;
}

export interface TransferRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  metadata?: TransactionMetadata;
}

export interface MintRequest {
  toAddress: string;
  amount: number;
  assetBacking: Record<string, number>;
}

export interface BurnRequest {
  fromAddress: string;
  amount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ComplianceAlert {
  id: string;
  walletAddress: string;
  activityType: string;
  description: string;
  detectedAt: string;
  severity: SeverityLevel;
}

export enum SeverityLevel {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Critical = 'CRITICAL'
}
