/*
 * ----------------------------------------------------------------------------
 *  File:        tests.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Tests for consensus and insight log pallet
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

use crate::{mock::*, Error, Event, LogType};
use frame_support::{assert_noop, assert_ok};
use sp_runtime::traits::BadOrigin;
use pallet_agent_registry::{self, AgentStatus};
use sp_std::vec;

// Helper function to register an agent for testing
fn register_agent(agent_id: u64, role: &[u8]) {
    assert_ok!(AgentRegistry::register_agent(
        RuntimeOrigin::signed(agent_id),
        role.to_vec(),
        None
    ));
}

// Helper function to generate a simple signature for testing
fn generate_test_signature(agent_id: u64) -> Vec<u8> {
    let mut sig = b"signature_for_agent_".to_vec();
    sig.extend_from_slice(agent_id.to_string().as_bytes());
    sig
}

#[test]
fn submit_insight_works() {
    new_test_ext().execute_with(|| {
        // Register agent first
        let agent_id = 1;
        register_agent(agent_id, b"Lyra");
        
        // Go past genesis block so events get deposited
        System::set_block_number(1);
        
        // Submit insight
        let cid = b"QmZ1jGZ9kj8ERUhA51msXYpJv5LDxjjsK9RZYmyGqy4q4B".to_vec();
        assert_ok!(ConsensusLog::submit_insight(
            RuntimeOrigin::signed(agent_id),
            cid.clone(),
            None
        ));
        
        // Get the log ID from the event
        let log_id = match System::events().iter().find_map(|record| {
            if let RuntimeEvent::ConsensusLog(Event::InsightSubmitted { log_id, .. }) = &record.event {
                Some(log_id)
            } else {
                None
            }
        }) {
            Some(id) => id,
            None => panic!("InsightSubmitted event not found"),
        };
        
        // Check log exists with correct data
        let log = ConsensusLog::logs(log_id).unwrap();
        assert_eq!(log.log_type, LogType::Insight);
        assert_eq!(log.cid.to_vec(), cid);
        assert_eq!(log.agents_involved.len(), 1);
        assert_eq!(log.agents_involved[0], agent_id);
        assert_eq!(log.signatures.len(), 0); // No signatures yet
        
        // Check agent index was updated
        let agent_logs = ConsensusLog::logs_by_agent(agent_id);
        assert!(agent_logs.contains(log_id));
        
        // Check CID index was updated
        let cid_logs = ConsensusLog::logs_by_cid(log.cid.clone());
        assert!(cid_logs.contains(log_id));
    });
}

#[test]
fn submit_insight_fails_for_unregistered_agent() {
    new_test_ext().execute_with(|| {
        // Try to submit insight without registering agent
        let agent_id = 1;
        let cid = b"QmZ1jGZ9kj8ERUhA51msXYpJv5LDxjjsK9RZYmyGqy4q4B".to_vec();
        
        assert_noop!(
            ConsensusLog::submit_insight(
                RuntimeOrigin::signed(agent_id),
                cid,
                None
            ),
            Error::<Test>::AgentNotFound
        );
    });
}

#[test]
fn log_consensus_works() {
    new_test_ext().execute_with(|| {
        // Register multiple agents
        register_agent(1, b"Lyra");
        register_agent(2, b"Echo");
        register_agent(3, b"Verdict");
        
        // Go past genesis block
        System::set_block_number(1);
        
        // Log consensus with multiple agents
        let cid = b"QmConsensus123456789ABCDEF".to_vec();
        let agents_involved = vec![1, 2, 3];
        let signature = generate_test_signature(1);
        
        assert_ok!(ConsensusLog::log_consensus(
            RuntimeOrigin::signed(1),
            cid.clone(),
            agents_involved.clone(),
            signature.clone(),
            None
        ));
        
        // Get the log ID from the event
        let log_id = match System::events().iter().find_map(|record| {
            if let RuntimeEvent::ConsensusLog(Event::ConsensusLogged { log_id, .. }) = &record.event {
                Some(log_id)
            } else {
                None
            }
        }) {
            Some(id) => id,
            None => panic!("ConsensusLogged event not found"),
        };
        
        // Check log exists with correct data
        let log = ConsensusLog::logs(log_id).unwrap();
        assert_eq!(log.log_type, LogType::Consensus);
        assert_eq!(log.cid.to_vec(), cid);
        assert_eq!(log.agents_involved.len(), 3);
        assert_eq!(log.signatures.len(), 1);
        assert_eq!(log.signatures[0].agent_id, 1);
        assert_eq!(log.signatures[0].signature.to_vec(), signature);
        
        // Check agent indices were updated for all agents
        for agent_id in agents_involved {
            let agent_logs = ConsensusLog::logs_by_agent(agent_id);
            assert!(agent_logs.contains(log_id));
        }
    });
}

#[test]
fn log_consensus_fails_with_too_few_agents() {
    new_test_ext().execute_with(|| {
        // Register agent
        register_agent(1, b"Lyra");
        
        // Try to log consensus with only one agent
        let cid = b"QmConsensus123456789ABCDEF".to_vec();
        let agents_involved = vec![1]; // Only one agent
        let signature = generate_test_signature(1);
        
        assert_noop!(
            ConsensusLog::log_consensus(
                RuntimeOrigin::signed(1),
                cid.clone(),
                agents_involved,
                signature,
                None
            ),
            Error::<Test>::NotEnoughAgents
        );
    });
}

#[test]
fn sign_log_works() {
    new_test_ext().execute_with(|| {
        // Register multiple agents
        register_agent(1, b"Lyra");
        register_agent(2, b"Echo");
        
        // Submit insight from agent 1
        let cid = b"QmTest123456789ABCDEF".to_vec();
        assert_ok!(ConsensusLog::submit_insight(
            RuntimeOrigin::signed(1),
            cid.clone(),
            None
        ));
        
        // Get the log ID
        let log_id = ConsensusLog::logs_by_agent(1)[0];
        
        // Modify the log to include agent 2 in agents_involved
        frame_support::storage::StorageMap::<_, _, _, _>::mutate(
            &crate::Logs::<Test>::hashed_key_for(log_id),
            |maybe_log| {
                if let Some(log) = maybe_log {
                    log.agents_involved.try_push(2).expect("Should be able to add agent");
                }
            }
        );
        
        // Now agent 2 signs the log
        let signature = generate_test_signature(2);
        assert_ok!(ConsensusLog::sign_log(
            RuntimeOrigin::signed(2),
            log_id,
            signature.clone()
        ));
        
        // Check signature was added
        let log = ConsensusLog::logs(log_id).unwrap();
        assert_eq!(log.signatures.len(), 1);
        assert_eq!(log.signatures[0].agent_id, 2);
        assert_eq!(log.signatures[0].signature.to_vec(), signature);
    });
}

#[test]
fn sign_log_fails_for_already_signed() {
    new_test_ext().execute_with(|| {
        // Register multiple agents and log consensus with signature
        register_agent(1, b"Lyra");
        register_agent(2, b"Echo");
        
        let cid = b"QmConsensus123456789ABCDEF".to_vec();
        let agents_involved = vec![1, 2];
        let signature = generate_test_signature(1);
        
        assert_ok!(ConsensusLog::log_consensus(
            RuntimeOrigin::signed(1),
            cid.clone(),
            agents_involved,
            signature,
            None
        ));
        
        // Get the log ID
        let log_id = ConsensusLog::logs_by_agent(1)[0];
        
        // Try to sign again with same agent
        assert_noop!(
            ConsensusLog::sign_log(
                RuntimeOrigin::signed(1),
                log_id,
                generate_test_signature(1)
            ),
            Error::<Test>::AlreadySigned
        );
    });
}

#[test]
fn sign_log_fails_for_agent_not_involved() {
    new_test_ext().execute_with(|| {
        // Register multiple agents
        register_agent(1, b"Lyra");
        register_agent(2, b"Echo");
        register_agent(3, b"Verdict");
        
        // Log consensus with only agents 1 and 2
        let cid = b"QmConsensus123456789ABCDEF".to_vec();
        let agents_involved = vec![1, 2];
        let signature = generate_test_signature(1);
        
        assert_ok!(ConsensusLog::log_consensus(
            RuntimeOrigin::signed(1),
            cid.clone(),
            agents_involved,
            signature,
            None
        ));
        
        // Get the log ID
        let log_id = ConsensusLog::logs_by_agent(1)[0];
        
        // Try to sign with agent 3 who wasn't involved
        assert_noop!(
            ConsensusLog::sign_log(
                RuntimeOrigin::signed(3),
                log_id,
                generate_test_signature(3)
            ),
            Error::<Test>::AgentNotFound
        );
    });
} 