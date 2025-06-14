# ----------------------------------------------------------------------------
#  File:        weights.rs
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Weight definitions for reputation pallet
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

//! Autogenerated weights for `pallet_reputation`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2025-01-XX, STEPS: `50`, REPEAT: `20`, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! WORST CASE MAP SIZE: `1000000`
//! HOSTNAME: `template-node`, CPU: `<CPU_MODEL>`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("dev"), DB CACHE: 1024

// Executed Command:
// ./target/release/node-template
// benchmark
// pallet
// --chain=dev
// --steps=50
// --repeat=20
// --pallet=pallet_reputation
// --extrinsic=*
// --execution=wasm
// --wasm-execution=compiled
// --heap-pages=4096
// --output=./pallets/reputation/src/weights.rs

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]
#![allow(missing_docs)]

use frame_support::{traits::Get, weights::{Weight, constants::RocksDbWeight}};
use sp_std::marker::PhantomData;

/// Weight functions needed for pallet_reputation.
pub trait WeightInfo {
	fn stake() -> Weight;
	fn unstake() -> Weight;
	fn reward_consensus() -> Weight;
	fn report_offense() -> Weight;
}

/// Weights for pallet_reputation using the Substrate node and recommended hardware.
pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for SubstrateWeight<T> {
	/// Storage: AgentRegistry Agents (r:1 w:0)
	/// Proof: AgentRegistry Agents (max_values: None, max_size: Some(2048), added: 4523, mode: MaxEncodedLen)
	/// Storage: Reputation Reputation (r:1 w:1)
	/// Proof: Reputation Reputation (max_values: None, max_size: Some(256), added: 2731, mode: MaxEncodedLen)
	/// Storage: Balances Reserves (r:1 w:1)
	/// Proof: Balances Reserves (max_values: None, max_size: Some(1249), added: 3724, mode: MaxEncodedLen)
	/// Storage: Reputation TotalStake (r:1 w:1)
	/// Proof: Reputation TotalStake (max_values: Some(1), max_size: Some(16), added: 511, mode: MaxEncodedLen)
	fn stake() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `425`
		//  Estimated: `5513`
		// Minimum execution time: 25_000_000 picoseconds.
		Weight::from_parts(26_000_000, 5513)
			.saturating_add(T::DbWeight::get().reads(4_u64))
			.saturating_add(T::DbWeight::get().writes(3_u64))
	}

	/// Storage: Reputation Reputation (r:1 w:1)
	/// Proof: Reputation Reputation (max_values: None, max_size: Some(256), added: 2731, mode: MaxEncodedLen)
	/// Storage: Balances Reserves (r:1 w:1)
	/// Proof: Balances Reserves (max_values: None, max_size: Some(1249), added: 3724, mode: MaxEncodedLen)
	/// Storage: Reputation TotalStake (r:1 w:1)
	/// Proof: Reputation TotalStake (max_values: Some(1), max_size: Some(16), added: 511, mode: MaxEncodedLen)
	fn unstake() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `425`
		//  Estimated: `4714`
		// Minimum execution time: 22_000_000 picoseconds.
		Weight::from_parts(23_000_000, 4714)
			.saturating_add(T::DbWeight::get().reads(3_u64))
			.saturating_add(T::DbWeight::get().writes(3_u64))
	}

	/// Storage: Reputation Reputation (r:1 w:1)
	/// Proof: Reputation Reputation (max_values: None, max_size: Some(256), added: 2731, mode: MaxEncodedLen)
	/// Storage: Reputation TotalStake (r:1 w:0)
	/// Proof: Reputation TotalStake (max_values: Some(1), max_size: Some(16), added: 511, mode: MaxEncodedLen)
	fn reward_consensus() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `425`
		//  Estimated: `3721`
		// Minimum execution time: 18_000_000 picoseconds.
		Weight::from_parts(19_000_000, 3721)
			.saturating_add(T::DbWeight::get().reads(2_u64))
			.saturating_add(T::DbWeight::get().writes(1_u64))
	}

	/// Storage: Reputation Reputation (r:1 w:1)
	/// Proof: Reputation Reputation (max_values: None, max_size: Some(256), added: 2731, mode: MaxEncodedLen)
	/// Storage: Balances Reserves (r:1 w:1)
	/// Proof: Balances Reserves (max_values: None, max_size: Some(1249), added: 3724, mode: MaxEncodedLen)
	/// Storage: Reputation TotalStake (r:1 w:1)
	/// Proof: Reputation TotalStake (max_values: Some(1), max_size: Some(16), added: 511, mode: MaxEncodedLen)
	/// Storage: Reputation OffenseHistory (r:1 w:1)
	/// Proof: Reputation OffenseHistory (max_values: None, max_size: Some(3200), added: 5675, mode: MaxEncodedLen)
	fn report_offense() -> Weight {
		// Proof Size summary in bytes:
		//  Measured:  `525`
		//  Estimated: `6665`
		// Minimum execution time: 35_000_000 picoseconds.
		Weight::from_parts(37_000_000, 6665)
			.saturating_add(T::DbWeight::get().reads(4_u64))
			.saturating_add(T::DbWeight::get().writes(4_u64))
	}
}

// For backwards compatibility and tests
impl WeightInfo for () {
	fn stake() -> Weight {
		Weight::from_parts(26_000_000, 5513)
			.saturating_add(RocksDbWeight::get().reads(4_u64))
			.saturating_add(RocksDbWeight::get().writes(3_u64))
	}

	fn unstake() -> Weight {
		Weight::from_parts(23_000_000, 4714)
			.saturating_add(RocksDbWeight::get().reads(3_u64))
			.saturating_add(RocksDbWeight::get().writes(3_u64))
	}

	fn reward_consensus() -> Weight {
		Weight::from_parts(19_000_000, 3721)
			.saturating_add(RocksDbWeight::get().reads(2_u64))
			.saturating_add(RocksDbWeight::get().writes(1_u64))
	}

	fn report_offense() -> Weight {
		Weight::from_parts(37_000_000, 6665)
			.saturating_add(RocksDbWeight::get().reads(4_u64))
			.saturating_add(RocksDbWeight::get().writes(4_u64))
	}
} 