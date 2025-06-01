/*
 * ----------------------------------------------------------------------------
 *  File:        benchmarking.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Benchmarking for the Agent Registry pallet
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

//! Benchmarking for the Agent Registry pallet.

#![cfg(feature = "runtime-benchmarks")]

use super::*;
use crate::Pallet as AgentRegistry;
use frame_benchmarking::v2::*;
use frame_system::RawOrigin;
use sp_std::vec;

// Helper function to generate a role name based on an index
fn role_name(i: u32) -> Vec<u8> {
    let mut name = b"Agent_".to_vec();
    name.extend_from_slice(i.to_string().as_bytes());
    name
}

// Helper function to generate metadata based on an index
fn metadata(i: u32) -> Vec<u8> {
    let mut meta = b"Version: 1.0.".to_vec();
    meta.extend_from_slice(i.to_string().as_bytes());
    meta.extend_from_slice(b", Type: Benchmark".to_slice());
    meta
}

#[benchmarks]
mod benchmarks {
    use super::*;

    #[benchmark]
    fn register_agent() {
        let caller: T::AccountId = whitelisted_caller();
        let role = role_name(1);
        let meta = metadata(1);

        #[extrinsic_call]
        AgentRegistry::<T>::register_agent(RawOrigin::Signed(caller), role, Some(meta));
    }

    #[benchmark]
    fn update_status() {
        let caller: T::AccountId = whitelisted_caller();
        let role = role_name(2);
        
        // Register the agent first
        AgentRegistry::<T>::register_agent(RawOrigin::Signed(caller.clone()).into(), role, None)
            .expect("Agent should be registered");

        #[extrinsic_call]
        AgentRegistry::<T>::update_status(RawOrigin::Signed(caller), AgentStatus::Maintenance);
    }

    #[benchmark]
    fn update_metadata() {
        let caller: T::AccountId = whitelisted_caller();
        let role = role_name(3);
        let meta = metadata(3);
        
        // Register the agent first
        AgentRegistry::<T>::register_agent(RawOrigin::Signed(caller.clone()).into(), role, None)
            .expect("Agent should be registered");

        #[extrinsic_call]
        AgentRegistry::<T>::update_metadata(RawOrigin::Signed(caller), meta);
    }

    #[benchmark]
    fn update_trust_score() {
        let caller: T::AccountId = whitelisted_caller();
        let role = role_name(4);
        
        // Register the agent first
        AgentRegistry::<T>::register_agent(RawOrigin::Signed(caller.clone()).into(), role, None)
            .expect("Agent should be registered");

        #[extrinsic_call]
        AgentRegistry::<T>::update_trust_score(RawOrigin::Signed(caller.clone()), caller, 10);
    }

    impl_benchmark_test_suite!(
        AgentRegistry,
        crate::mock::new_test_ext(),
        crate::mock::Test,
    );
} 