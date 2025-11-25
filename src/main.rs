// src/main.rs
mod models;
mod engine;
mod compliance;
mod error;

use crate::engine::{HKDEngine, EngineConfig};
use crate::models::*;
use rust_decimal::Decimal;
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    
    println!("Starting HKD Stablecoin Project...");
    
    // Initialize engine with HK regulatory requirements
    let config = EngineConfig {
        max_transaction_amount: Decimal::from(1000000), // HKD 1,000,000
        min_kyc_level: KycStatus::Verified,
        reserve_requirement: Decimal::ONE, // 100% backing
        regulatory_authorities: vec![
            "HKMA".to_string(),
            "SFC".to_string(),
        ],
    };
    
    let engine = HKDEngine::new(config);
    
    // Example usage
    demo_stablecoin_operations(&engine).await?;
    
    Ok(())
}

async fn demo_stablecoin_operations(engine: &HKDEngine) -> Result<(), Box<dyn std::error::Error>> {
    println!("\n=== HKD Stablecoin Demo ===");
    
    // Initialize some demo wallets
    let corporate_wallet = "corp_abc123";
    let user_wallet = "user_xyz789";
    
    // In a real implementation, you'd have proper wallet creation
    // and KYC verification processes
    
    println!("\n1. Minting new HKD Coin for corporate entity...");
    
    let asset_backing = HashMap::from([
        ("HKD_Cash".to_string(), Decimal::from(1000000)),
    ]);
    
    match engine.mint(corporate_wallet, Decimal::from(1000000), asset_backing) {
        Ok(tx_id) => println!("✓ Successfully minted 1,000,000 HKD. TX: {}", tx_id),
        Err(e) => println!("✗ Minting failed: {}", e),
    }
    
    println!("\n2. Corporate transferring to user...");
    
    let metadata = Some(TransactionMetadata {
        reference: Some("salary_payment".to_string()),
        purpose: Some("salary".to_string()),
        regulatory_approval_id: None,
    });
    
    match engine.transfer(
        corporate_wallet,
        user_wallet,
        Decimal::from(50000),
        metadata,
    ) {
        Ok(tx_id) => println!("✓ Successfully transferred 50,000 HKD. TX: {}", tx_id),
        Err(e) => println!("✗ Transfer failed: {}", e),
    }
    
    println!("\n3. Checking reserve status...");
    let reserve = engine.get_reserve();
    println!("Reserve Ratio: {:.2}%", reserve.reserve_ratio * Decimal::from(100));
    println!("Total HKD in circulation: {}", reserve.hkd_balance);
    
    Ok(())
}
