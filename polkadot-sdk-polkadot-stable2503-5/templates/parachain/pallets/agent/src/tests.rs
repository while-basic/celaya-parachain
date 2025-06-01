/*
 * ----------------------------------------------------------------------------
 *  File:        tests.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Tests for the Agent Registry pallet
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

use crate::{mock::*, AgentStatus, Error, Event};
use frame_support::{assert_noop, assert_ok};
use sp_std::vec;

#[test]
fn register_agent_works() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        System::set_block_number(1);
        
        // Register a new agent
        let agent_id = 1;
        let role = "Lyra".as_bytes().to_vec();
        assert_ok!(AgentRegistry::register_agent(
            RuntimeOrigin::signed(agent_id),
            role.clone(),
            None
        ));
        
        // Check agent exists with correct data
        let agent = AgentRegistry::agents(agent_id).unwrap();
        assert_eq!(agent.pubkey, agent_id);
        assert_eq!(agent.role.to_vec(), role);
        assert_eq!(agent.status, AgentStatus::Online);
        assert_eq!(agent.trust_score, 0);
        assert_eq!(agent.registered_at, 1);
        assert!(agent.metadata.is_none());
        
        // Check event was emitted
        System::assert_has_event(Event::AgentRegistered { agent_id, role }.into());
    });
}

#[test]
fn register_agent_fails_when_already_registered() {
    new_test_ext().execute_with(|| {
        // Register agent first time
        let agent_id = 1;
        let role = "Lyra".as_bytes().to_vec();
        assert_ok!(AgentRegistry::register_agent(
            RuntimeOrigin::signed(agent_id),
            role.clone(),
            None
        ));
        
        // Try to register again
        assert_noop!(
            AgentRegistry::register_agent(
                RuntimeOrigin::signed(agent_id),
                "Echo".as_bytes().to_vec(),
                None
            ),
            Error::<Test>::AgentAlreadyExists
        );
    });
}

#[test]
fn register_agent_fails_with_empty_role() {
    new_test_ext().execute_with(|| {
        // Try to register with empty role
        let agent_id = 1;
        assert_noop!(
            AgentRegistry::register_agent(
                RuntimeOrigin::signed(agent_id),
                vec![],
                None
            ),
            Error::<Test>::InvalidRole
        );
    });
}

#[test]
fn update_status_works() {
    new_test_ext().execute_with(|| {
        // Register agent first
        let agent_id = 1;
        let role = "Lyra".as_bytes().to_vec();
        assert_ok!(AgentRegistry::register_agent(
            RuntimeOrigin::signed(agent_id),
            role,
            None
        ));
        
        // Go to block 2 for event checking
        System::set_block_number(2);
        
        // Update agent status
        assert_ok!(AgentRegistry::update_status(
            RuntimeOrigin::signed(agent_id),
            AgentStatus::Maintenance
        ));
        
        // Check agent has new status
        let agent = AgentRegistry::agents(agent_id).unwrap();
        assert_eq!(agent.status, AgentStatus::Maintenance);
        
        // Check event was emitted
        System::assert_has_event(Event::AgentStatusUpdated { 
            agent_id, 
            status: AgentStatus::Maintenance 
        }.into());
    });
}

#[test]
fn update_status_fails_for_nonexistent_agent() {
    new_test_ext().execute_with(|| {
        // Try to update status for non-registered agent
        let agent_id = 1;
        assert_noop!(
            AgentRegistry::update_status(
                RuntimeOrigin::signed(agent_id),
                AgentStatus::Offline
            ),
            Error::<Test>::AgentNotFound
        );
    });
}

#[test]
fn update_metadata_works() {
    new_test_ext().execute_with(|| {
        // Register agent first
        let agent_id = 1;
        let role = "Lyra".as_bytes().to_vec();
        assert_ok!(AgentRegistry::register_agent(
            RuntimeOrigin::signed(agent_id),
            role,
            None
        ));
        
        // Go to block 2 for event checking
        System::set_block_number(2);
        
        // Update agent metadata
        let metadata = "version=1.0,capabilities=full".as_bytes().to_vec();
        assert_ok!(AgentRegistry::update_metadata(
            RuntimeOrigin::signed(agent_id),
            metadata.clone()
        ));
        
        // Check agent has new metadata
        let agent = AgentRegistry::agents(agent_id).unwrap();
        assert_eq!(agent.metadata.unwrap().to_vec(), metadata);
        
        // Check event was emitted
        System::assert_has_event(Event::AgentMetadataUpdated { 
            agent_id
        }.into());
    });
}

#[test]
fn update_trust_score_works() {
    new_test_ext().execute_with(|| {
        // Register agent first
        let agent_id = 1;
        let role = "Lyra".as_bytes().to_vec();
        assert_ok!(AgentRegistry::register_agent(
            RuntimeOrigin::signed(agent_id),
            role,
            None
        ));
        
        // Go to block 2 for event checking
        System::set_block_number(2);
        
        // Update trust score
        assert_ok!(AgentRegistry::update_trust_score(
            RuntimeOrigin::signed(agent_id),
            agent_id,
            10
        ));
        
        // Check agent has new trust score
        let agent = AgentRegistry::agents(agent_id).unwrap();
        assert_eq!(agent.trust_score, 10);
        
        // Check event was emitted
        System::assert_has_event(Event::TrustScoreUpdated { 
            agent_id,
            new_score: 10
        }.into());
        
        // Test negative update
        assert_ok!(AgentRegistry::update_trust_score(
            RuntimeOrigin::signed(agent_id),
            agent_id,
            -5
        ));
        
        // Check agent has updated trust score
        let agent = AgentRegistry::agents(agent_id).unwrap();
        assert_eq!(agent.trust_score, 5);
    });
} 