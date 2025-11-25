// src/models.rs
use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;
use chrono::{DateTime, Utc};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Wallet {
    pub address: String,
    pub balance: Decimal,
    pub frozen: bool,
    pub kyc_status: KycStatus,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum KycStatus {
    Pending,
    Verified,
    Rejected,
    EnhancedVerified, // For higher limits
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub from_address: String,
    pub to_address: String,
    pub amount: Decimal,
    pub transaction_type: TransactionType,
    pub status: TransactionStatus,
    pub created_at: DateTime<Utc>,
    pub metadata: Option<TransactionMetadata>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionType {
    Transfer,
    Mint,    // Issuing new HKD Coin
    Burn,    // Redeeming for fiat
    Freeze,  // Regulatory freeze
    Unfreeze,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionStatus {
    Pending,
    Completed,
    Failed,
    Frozen, // Regulatory hold
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionMetadata {
    pub reference: Option<String>,
    pub purpose: Option<String>, // e.g., "salary", "investment"
    pub regulatory_approval_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reserve {
    pub hkd_balance: Decimal,
    pub assets: HashMap<String, Decimal>, // Asset types and amounts
    pub last_audit: DateTime<Utc>,
    pub reserve_ratio: Decimal, // Must be >= 1.0 (100%)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegulatoryReport {
    pub id: String,
    pub report_type: ReportType,
    pub data: serde_json::Value,
    pub generated_at: DateTime<Utc>,
    pub submitted_to: Vec<String>, // HKMA, SFC, etc.
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportType {
    DailyTransaction,
    ReserveAudit,
    SuspiciousActivity,
    MonthlyCompliance,
}
