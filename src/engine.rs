// src/engine.rs
use crate::models::*;
use crate::error::HKDError;
use rust_decimal::Decimal;
use std::collections::HashMap;
use std::sync::RwLock;
use log::{info, warn, error};

pub struct HKDEngine {
    wallets: RwLock<HashMap<String, Wallet>>,
    transactions: RwLock<HashMap<String, Transaction>>,
    reserve: RwLock<Reserve>,
    config: EngineConfig,
}

#[derive(Debug, Clone)]
pub struct EngineConfig {
    pub max_transaction_amount: Decimal,
    pub min_kyc_level: KycStatus,
    pub reserve_requirement: Decimal, // e.g., 1.0 for 100% backing
    pub regulatory_authorities: Vec<String>,
}

impl HKDEngine {
    pub fn new(config: EngineConfig) -> Self {
        let initial_reserve = Reserve {
            hkd_balance: Decimal::ZERO,
            assets: HashMap::new(),
            last_audit: Utc::now(),
            reserve_ratio: Decimal::ONE,
        };

        HKDEngine {
            wallets: RwLock::new(HashMap::new()),
            transactions: RwLock::new(HashMap::new()),
            reserve: RwLock::new(initial_reserve),
            config,
        }
    }

    /// Mint new HKD Coin (only authorized entities)
    pub fn mint(
        &self,
        to_address: &str,
        amount: Decimal,
        asset_backing: HashMap<String, Decimal>,
    ) -> Result<String, HKDError> {
        // Verify reserve backing
        self.verify_reserve_backing(&asset_backing, amount)?;
        
        // Update reserve
        let mut reserve = self.reserve.write().unwrap();
        reserve.hkd_balance += amount;
        for (asset, asset_amount) in asset_backing {
            *reserve.assets.entry(asset).or_insert(Decimal::ZERO) += asset_amount;
        }
        reserve.reserve_ratio = self.calculate_reserve_ratio(&reserve);

        // Credit recipient wallet
        self.credit_wallet(to_address, amount)?;

        let tx_id = Self::generate_tx_id();
        let transaction = Transaction {
            id: tx_id.clone(),
            from_address: "RESERVE_MINT".to_string(),
            to_address: to_address.to_string(),
            amount,
            transaction_type: TransactionType::Mint,
            status: TransactionStatus::Completed,
            created_at: Utc::now(),
            metadata: None,
        };

        self.record_transaction(transaction)?;
        
        info!("Minted {} HKD to {}", amount, to_address);
        Ok(tx_id)
    }

    /// Transfer between wallets
    pub fn transfer(
        &self,
        from_address: &str,
        to_address: &str,
        amount: Decimal,
        metadata: Option<TransactionMetadata>,
    ) -> Result<String, HKDError> {
        // Validate wallets and KYC
        self.validate_transfer(from_address, to_address, amount)?;

        // Check AML/CFT limits
        self.check_compliance_limits(from_address, to_address, amount)?;

        // Execute transfer
        self.debit_wallet(from_address, amount)?;
        self.credit_wallet(to_address, amount)?;

        let tx_id = Self::generate_tx_id();
        let transaction = Transaction {
            id: tx_id.clone(),
            from_address: from_address.to_string(),
            to_address: to_address.to_string(),
            amount,
            transaction_type: TransactionType::Transfer,
            status: TransactionStatus::Completed,
            created_at: Utc::now(),
            metadata,
        };

        self.record_transaction(transaction)?;
        
        info!("Transferred {} HKD from {} to {}", amount, from_address, to_address);
        Ok(tx_id)
    }

    /// Burn HKD Coin (redeem for underlying assets)
    pub fn burn(
        &self,
        from_address: &str,
        amount: Decimal,
    ) -> Result<String, HKDError> {
        // Verify sufficient balance
        self.debit_wallet(from_address, amount)?;

        // Update reserve
        let mut reserve = self.reserve.write().unwrap();
        reserve.hkd_balance -= amount;
        // In practice, you'd release the underlying assets here
        reserve.reserve_ratio = self.calculate_reserve_ratio(&reserve);

        let tx_id = Self::generate_tx_id();
        let transaction = Transaction {
            id: tx_id.clone(),
            from_address: from_address.to_string(),
            to_address: "RESERVE_BURN".to_string(),
            amount,
            transaction_type: TransactionType::Burn,
            status: TransactionStatus::Completed,
            created_at: Utc::now(),
            metadata: None,
        };

        self.record_transaction(transaction)?;
        
        info!("Burned {} HKD from {}", amount, from_address);
        Ok(tx_id)
    }

    // Validation and helper methods
    fn validate_transfer(
        &self,
        from: &str,
        to: &str,
        amount: Decimal,
    ) -> Result<(), HKDError> {
        if amount <= Decimal::ZERO {
            return Err(HKDError::InvalidAmount);
        }

        if amount > self.config.max_transaction_amount {
            return Err(HKDError::AmountExceedsLimit);
        }

        let wallets = self.wallets.read().unwrap();
        let from_wallet = wallets.get(from)
            .ok_or(HKDError::WalletNotFound)?;
        let to_wallet = wallets.get(to)
            .ok_or(HKDError::WalletNotFound)?;

        if from_wallet.frozen || to_wallet.frozen {
            return Err(HKDError::WalletFrozen);
        }

        if from_wallet.kyc_status < self.config.min_kyc_level ||
           to_wallet.kyc_status < self.config.min_kyc_level {
            return Err(HKDError::InsufficientKyc);
        }

        if from_wallet.balance < amount {
            return Err(HKDError::InsufficientBalance);
        }

        Ok(())
    }

    fn check_compliance_limits(
        &self,
        from: &str,
        to: &str,
        amount: Decimal,
    ) -> Result<(), HKDError> {
        // Implement HKMA AML/CFT checks
        // This would integrate with regulatory monitoring systems
        
        // Example: Flag large transactions
        if amount > Decimal::from(80000) { // HKD 80,000 threshold
            warn!("Large transaction detected: {} HKD from {} to {}", amount, from, to);
            // In practice, this would trigger a regulatory report
        }

        Ok(())
    }

    fn credit_wallet(&self, address: &str, amount: Decimal) -> Result<(), HKDError> {
        let mut wallets = self.wallets.write().unwrap();
        if let Some(wallet) = wallets.get_mut(address) {
            wallet.balance += amount;
            Ok(())
        } else {
            Err(HKDError::WalletNotFound)
        }
    }

    fn debit_wallet(&self, address: &str, amount: Decimal) -> Result<(), HKDError> {
        let mut wallets = self.wallets.write().unwrap();
        if let Some(wallet) = wallets.get_mut(address) {
            if wallet.balance >= amount {
                wallet.balance -= amount;
                Ok(())
            } else {
                Err(HKDError::InsufficientBalance)
            }
        } else {
            Err(HKDError::WalletNotFound)
        }
    }

    fn verify_reserve_backing(
        &self,
        asset_backing: &HashMap<String, Decimal>,
        mint_amount: Decimal,
    ) -> Result<(), HKDError> {
        // Verify that the assets provided are sufficient to back the minting
        // This would involve checking asset valuations, liquidity, etc.
        let total_value = self.calculate_asset_value(asset_backing)?;
        
        if total_value < mint_amount {
            return Err(HKDError::InsufficientReserveBacking);
        }

        Ok(())
    }

    fn calculate_asset_value(
        &self,
        assets: &HashMap<String, Decimal>,
    ) -> Result<Decimal, HKDError> {
        // In practice, this would fetch real-time market prices
        // For now, assume 1:1 backing with HKD cash
        Ok(assets.values().sum())
    }

    fn calculate_reserve_ratio(&self, reserve: &Reserve) -> Decimal {
        if reserve.hkd_balance == Decimal::ZERO {
            return Decimal::ONE;
        }
        
        let total_assets_value = self.calculate_asset_value(&reserve.assets)
            .unwrap_or(Decimal::ZERO);
        
        total_assets_value / reserve.hkd_balance
    }

    fn record_transaction(&self, transaction: Transaction) -> Result<(), HKDError> {
        let mut transactions = self.transactions.write().unwrap();
        transactions.insert(transaction.id.clone(), transaction);
        Ok(())
    }

    fn generate_tx_id() -> String {
        uuid::Uuid::new_v4().to_string()
    }

    // Public getters for state
    pub fn get_wallet(&self, address: &str) -> Option<Wallet> {
        self.wallets.read().unwrap().get(address).cloned()
    }

    pub fn get_reserve(&self) -> Reserve {
        self.reserve.read().unwrap().clone()
    }
}
