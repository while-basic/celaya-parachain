/*
 * ----------------------------------------------------------------------------
 *  File:        mock.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Mock runtime for testing the Consensus Log pallet
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

use crate as pallet_consensus_log;
use frame::prelude::*;
use frame_support::{
    parameter_types,
    traits::{ConstU16, ConstU32, ConstU64},
};
use frame_system as system;
use sp_core::H256;
use sp_runtime::{
    traits::{BlakeTwo256, IdentityLookup},
    BuildStorage,
};
use pallet_agent_registry as agent_registry;

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
    pub enum Test
    {
        System: frame_system,
        AgentRegistry: pallet_agent_registry,
        ConsensusLog: pallet_consensus_log,
    }
);

impl frame_system::Config for Test {
    type BaseCallFilter = frame_support::traits::Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type RuntimeCall = RuntimeCall;
    type Nonce = u64;
    type Hash = H256;
    type Hashing = BlakeTwo256;
    type AccountId = u64;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Block = Block;
    type RuntimeEvent = RuntimeEvent;
    type RuntimeOrigin = RuntimeOrigin;
    type BlockHashCount = ConstU64<250>;
    type DbWeight = ();
    type Version = ();
    type PalletInfo = PalletInfo;
    type AccountData = ();
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = ConstU16<42>;
    type OnSetCode = ();
    type MaxConsumers = frame_support::traits::ConstU32<16>;
}

parameter_types! {
    pub const MaxRoleLength: u32 = 32;
    pub const MaxMetadataLength: u32 = 1024;
}

impl pallet_agent_registry::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type MaxRoleLength = MaxRoleLength;
    type MaxMetadataLength = MaxMetadataLength;
}

// Custom type for MaxSignatureLength that implements Eq
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MaxSigLen;
impl Get<u32> for MaxSigLen {
    fn get() -> u32 {
        256
    }
}

parameter_types! {
    pub const MaxCIDLength: u32 = 64;
    pub const MaxConsensusMetadataLength: u32 = 2048;
    pub const MaxAgentsInvolved: u32 = 32;
    pub const MaxSignatures: u32 = 32;
}

impl pallet_consensus_log::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type MaxCIDLength = MaxCIDLength;
    type MaxMetadataLength = MaxConsensusMetadataLength;
    type MaxAgentsInvolved = MaxAgentsInvolved;
    type MaxSignatureLength = MaxSigLen;
    type MaxSignatures = MaxSignatures;
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    frame_system::GenesisConfig::<Test>::default().build_storage().unwrap().into()
}

// Helper function to register an agent for testing
pub fn register_test_agent(agent_id: u64, role: &[u8]) {
    pallet_agent_registry::Pallet::<Test>::register_agent(
        RuntimeOrigin::signed(agent_id),
        role.to_vec(),
        None,
    ).expect("Agent should be registered successfully");
} 