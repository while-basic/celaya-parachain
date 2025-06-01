/*
 * ----------------------------------------------------------------------------
 *  File:        benchmarking.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Benchmarking for the Consensus Log pallet
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

//! Benchmarking for the Consensus Log pallet.

#![cfg(feature = "runtime-benchmarks")]

use super::*;
use crate::Pallet as ConsensusLog;
use frame_benchmarking::v2::*;
use frame_system::RawOrigin;
use pallet_agent_registry::{AgentStatus, Pallet as AgentRegistry};
use sp_std::vec;

// Helper function to generate a CID based on an index
fn generate_cid(i: u32) -> Vec<u8> {
    let mut cid = b"QmBench".to_vec();
    cid.extend_from_slice(i.to_string().as_bytes());
    cid.extend_from_slice(b"123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".as_slice());
    cid
}

// Helper function to generate a signature based on an index
fn generate_signature(i: u32) -> Vec<u8> {
    let mut sig = b"Signature_".to_vec();
    sig.extend_from_slice(i.to_string().as_bytes());
    sig.extend_from_slice(b"_ABCDEFGHIJKLMNOPQRSTUVWXYZ".as_slice());
    sig
}

// Helper function to register agents for benchmarking
fn register_agents<T: Config>(n: u32) -> Vec<T::AccountId> {
    let mut agents = Vec::new();
    
    for i in 0..n {
        let account: T::AccountId = account("agent", i, 0);
        let role = format!("Agent_{}", i).into_bytes();
        
        AgentRegistry::<T>::register_agent(
            RawOrigin::Signed(account.clone()).into(),
            role,
            None
        ).expect("Failed to register agent");
        
        agents.push(account);
    }
    
    agents
}

#[benchmarks]
mod benchmarks {
    use super::*;

    #[benchmark]
    fn submit_insight() {
        let agents = register_agents::<T>(1);
        let caller = agents[0].clone();
        let cid = generate_cid(1);

        #[extrinsic_call]
        ConsensusLog::<T>::submit_insight(RawOrigin::Signed(caller), cid, None);
    }

    #[benchmark]
    fn log_consensus() {
        let agents = register_agents::<T>(3);
        let caller = agents[0].clone();
        let cid = generate_cid(2);
        let signature = generate_signature(1);
        
        // Convert Vec<T::AccountId> to Vec<T::AccountId>
        let involved_agents: Vec<T::AccountId> = agents.clone();

        #[extrinsic_call]
        ConsensusLog::<T>::log_consensus(
            RawOrigin::Signed(caller), 
            cid, 
            involved_agents, 
            signature, 
            None
        );
    }

    #[benchmark]
    fn sign_log() {
        let agents = register_agents::<T>(2);
        let submitter = agents[0].clone();
        let signer = agents[1].clone();
        let cid = generate_cid(3);
        let signature1 = generate_signature(1);
        let signature2 = generate_signature(2);
        
        // Log a consensus with both agents
        let involved_agents: Vec<T::AccountId> = agents.clone();
        
        ConsensusLog::<T>::log_consensus(
            RawOrigin::Signed(submitter).into(),
            cid,
            involved_agents,
            signature1,
            None
        ).expect("Failed to log consensus");
        
        // Find the log_id
        let logs = Pallet::<T>::logs_by_agent(submitter.clone());
        let log_id = logs.get(0).expect("Log should exist").clone();

        #[extrinsic_call]
        ConsensusLog::<T>::sign_log(RawOrigin::Signed(signer), log_id, signature2);
    }

    impl_benchmark_test_suite!(
        ConsensusLog,
        crate::mock::new_test_ext(),
        crate::mock::Test,
    );
} 