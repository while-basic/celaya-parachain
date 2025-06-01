/*
 * ----------------------------------------------------------------------------
 *  File:        lib.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Agent Registry pallet for C-Suite blockchain
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

//! # Agent Registry Pallet
//!
//! A pallet for registering and managing C-Suite agents on the blockchain.
//!
//! ## Overview
//!
//! This pallet provides functionality to:
//! - Register new C-Suite agents with roles, public keys, and metadata
//! - Update agent status (online/offline/retired)
//! - Query agent information
//! - Track agent trust scores
//!
//! Each agent in the C-Suite system (Lyra, Echo, Verdict, etc.) is registered on-chain
//! with their role, public key, and current status.

#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;

#[frame::pallet]
pub mod pallet {
    use frame::prelude::*;
    use frame::deps::codec::{Decode, Encode};
    use alloc::vec::Vec;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        /// The overarching event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        
        /// Maximum length for agent role string
        #[pallet::constant]
        type MaxRoleLength: Get<u32>;
        
        /// Maximum length for agent metadata
        #[pallet::constant]
        type MaxMetadataLength: Get<u32>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    /// Agent status represented as u8
    /// 0 = Offline, 1 = Online, 2 = Retired, 3 = Maintenance
    pub type AgentStatus = u8;
    
    pub const AGENT_STATUS_OFFLINE: u8 = 0;
    pub const AGENT_STATUS_ONLINE: u8 = 1;
    pub const AGENT_STATUS_RETIRED: u8 = 2;
    pub const AGENT_STATUS_MAINTENANCE: u8 = 3;

    /// Agent information stored on-chain
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct AgentInfo<T: Config> {
        /// The public key of the agent (same as account ID in this implementation)
        pub pubkey: T::AccountId,
        /// Agent role (e.g., "Lyra", "Echo", "Volt", etc.)
        pub role: BoundedVec<u8, T::MaxRoleLength>,
        /// Trust score that can be incremented based on successful consensus events
        pub trust_score: u64,
        /// Current status of the agent
        pub status: AgentStatus,
        /// When the agent was registered
        pub registered_at: BlockNumberFor<T>,
        /// Optional metadata about the agent (e.g., version, capabilities)
        pub metadata: Option<BoundedVec<u8, T::MaxMetadataLength>>,
    }

    /// Storage for all registered agents
    #[pallet::storage]
    #[pallet::getter(fn agents)]
    pub type Agents<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,  // Agent ID (using AccountId as the unique identifier)
        AgentInfo<T>,
        OptionQuery,
    >;

    /// Events emitted by the pallet
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// A new agent was registered
        AgentRegistered {
            agent_id: T::AccountId,
            role: Vec<u8>,
        },
        /// An agent's status was updated
        AgentStatusUpdated {
            agent_id: T::AccountId,
            status: u8,
        },
        /// An agent's metadata was updated
        AgentMetadataUpdated {
            agent_id: T::AccountId,
        },
        /// An agent's trust score was updated
        TrustScoreUpdated {
            agent_id: T::AccountId,
            new_score: u64,
        },
    }

    /// Errors that can occur in the pallet
    #[pallet::error]
    pub enum Error<T> {
        /// Agent already exists
        AgentAlreadyExists,
        /// Agent does not exist
        AgentNotFound,
        /// Invalid role provided
        InvalidRole,
        /// Invalid metadata format
        InvalidMetadata,
        /// Agent is not active (offline or retired)
        AgentNotActive,
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Register a new agent
        ///
        /// The origin must be signed by the account that will be registered as the agent.
        /// Parameters:
        /// - `role`: The role of the agent (e.g., "Lyra", "Echo", "Volt")
        /// - `metadata`: Optional metadata about the agent
        #[pallet::call_index(0)]
        #[pallet::weight(Weight::from_parts(10_000, 0).saturating_add(T::DbWeight::get().reads_writes(1, 1)))]
        pub fn register_agent(
            origin: OriginFor<T>,
            role: Vec<u8>,
            metadata: Option<Vec<u8>>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // Ensure agent doesn't already exist
            ensure!(!Agents::<T>::contains_key(&who), Error::<T>::AgentAlreadyExists);
            
            // Validate and bound the role
            ensure!(!role.is_empty(), Error::<T>::InvalidRole);
            let bounded_role = BoundedVec::<u8, T::MaxRoleLength>::try_from(role.clone())
                .map_err(|_| Error::<T>::InvalidRole)?;
                
            // Validate and bound the metadata if provided
            let bounded_metadata = if let Some(meta) = metadata {
                Some(BoundedVec::<u8, T::MaxMetadataLength>::try_from(meta)
                    .map_err(|_| Error::<T>::InvalidMetadata)?)
            } else {
                None
            };
            
            // Create agent info
            let agent_info = AgentInfo {
                pubkey: who.clone(),
                role: bounded_role,
                trust_score: 0, // Start with 0 trust score
                status: AGENT_STATUS_ONLINE, // Start as online when registered
                registered_at: <frame_system::Pallet<T>>::block_number(),
                metadata: bounded_metadata,
            };
            
            // Store the agent
            Agents::<T>::insert(&who, agent_info);
            
            // Emit event
            Self::deposit_event(Event::AgentRegistered { 
                agent_id: who,
                role,
            });
            
            Ok(())
        }
        
        /// Update agent status
        ///
        /// Only the agent itself can update its status.
        /// Parameters:
        /// - `new_status`: The new status for the agent
        #[pallet::call_index(1)]
        #[pallet::weight(Weight::from_parts(5_000, 0).saturating_add(T::DbWeight::get().reads_writes(1, 1)))]
        pub fn update_status(
            origin: OriginFor<T>,
            new_status: u8,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // Update agent status if it exists
            Agents::<T>::try_mutate(&who, |maybe_agent| -> DispatchResult {
                let agent = maybe_agent.as_mut().ok_or(Error::<T>::AgentNotFound)?;
                agent.status = new_status;
                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::AgentStatusUpdated { 
                agent_id: who,
                status: new_status,
            });
            
            Ok(())
        }
        
        /// Update agent metadata
        ///
        /// Only the agent itself can update its metadata.
        /// Parameters:
        /// - `new_metadata`: The new metadata for the agent
        #[pallet::call_index(2)]
        #[pallet::weight(Weight::from_parts(5_000, 0).saturating_add(T::DbWeight::get().reads_writes(1, 1)))]
        pub fn update_metadata(
            origin: OriginFor<T>,
            new_metadata: Option<Vec<u8>>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // Validate and bound the new metadata if provided
            let bounded_metadata = if let Some(meta) = new_metadata {
                Some(BoundedVec::<u8, T::MaxMetadataLength>::try_from(meta)
                    .map_err(|_| Error::<T>::InvalidMetadata)?)
            } else {
                None
            };
            
            // Update agent metadata if it exists
            Agents::<T>::try_mutate(&who, |maybe_agent| -> DispatchResult {
                let agent = maybe_agent.as_mut().ok_or(Error::<T>::AgentNotFound)?;
                agent.metadata = bounded_metadata;
                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::AgentMetadataUpdated { 
                agent_id: who,
            });
            
            Ok(())
        }
        
        /// Increment trust score (internal function for consensus pallet)
        ///
        /// This should be called by the consensus pallet when an agent
        /// successfully participates in consensus.
        /// Parameters:
        /// - `agent_id`: The agent whose trust score to increment
        /// - `amount`: Amount to increment (default should be 10)
        #[pallet::call_index(3)]
        #[pallet::weight(Weight::from_parts(3_000, 0).saturating_add(T::DbWeight::get().reads_writes(1, 1)))]
        pub fn increment_trust_score(
            origin: OriginFor<T>,
            agent_id: T::AccountId,
            amount: u64,
        ) -> DispatchResult {
            ensure_root(origin)?; // Only root can call this (or consensus pallet)
            
            // Update agent trust score if it exists
            Agents::<T>::try_mutate(&agent_id, |maybe_agent| -> DispatchResult {
                let agent = maybe_agent.as_mut().ok_or(Error::<T>::AgentNotFound)?;
                agent.trust_score = agent.trust_score.saturating_add(amount);
                Ok(())
            })?;
            
            // Get the new score for the event
            let new_score = Agents::<T>::get(&agent_id)
                .ok_or(Error::<T>::AgentNotFound)?
                .trust_score;
            
            // Emit event
            Self::deposit_event(Event::TrustScoreUpdated { 
                agent_id,
                new_score,
            });
            
            Ok(())
        }
    }
    
    // Helper functions
    impl<T: Config> Pallet<T> {
        /// Check if an agent is active (online)
        pub fn is_agent_active(agent_id: &T::AccountId) -> bool {
            if let Some(agent) = Agents::<T>::get(agent_id) {
                agent.status == AGENT_STATUS_ONLINE
            } else {
                false
            }
        }
        
        /// Get agent trust score
        pub fn get_trust_score(agent_id: &T::AccountId) -> Option<u64> {
            Agents::<T>::get(agent_id).map(|agent| agent.trust_score)
        }
        
        /// Get all active agents
        pub fn get_active_agents() -> Vec<T::AccountId> {
            Agents::<T>::iter()
                .filter_map(|(agent_id, agent_info)| {
                    if agent_info.status == AGENT_STATUS_ONLINE {
                        Some(agent_id)
                    } else {
                        None
                    }
                })
                .collect()
        }
    }
}