// src/error.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum HKDError {
    #[error("Wallet not found")]
    WalletNotFound,
    
    #[error("Insufficient balance")]
    InsufficientBalance,
    
    #[error("Invalid amount")]
    InvalidAmount,
    
    #[error("Amount exceeds transaction limit")]
    AmountExceedsLimit,
    
    #[error("Wallet is frozen")]
    WalletFrozen,
    
    #[error("Insufficient KYC level")]
    InsufficientKyc,
    
    #[error("Insufficient reserve backing")]
    InsufficientReserveBacking,
    
    #[error("Regulatory compliance check failed")]
    ComplianceCheckFailed,
    
    #[error("Transaction not found")]
    TransactionNotFound,
    
    #[error("Serialization error: {0}")]
    SerializationError(String),
}
