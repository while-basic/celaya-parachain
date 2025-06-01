/*
 * ----------------------------------------------------------------------------
 *  File:        mock.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Mock runtime for testing the Agent Registry pallet
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

use crate as pallet_agent_registry;
use frame_support::{
    derive_impl,
    parameter_types,
    traits::{ConstU16, ConstU32, ConstU64},
    weights::Weight,
};
use frame_system as system;
use sp_core::H256;
use sp_runtime::{
    traits::{BlakeTwo256, IdentityLookup},
    BuildStorage,
};

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
    pub enum Test
    {
        System: frame_system,
        AgentRegistry: pallet_agent_registry,
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

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    frame_system::GenesisConfig::<Test>::default().build_storage().unwrap().into()
} 