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

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;

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

    /// Agent status enum
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    pub enum AgentStatus {
        /// Agent is online and active
        Online,
        /// Agent is offline but still registered
        Offline,
        /// Agent has been retired/decommissioned
        Retired,
        /// Agent is in maintenance mode
        Maintenance,
    }

    impl Default for AgentStatus {
        fn default() -> Self {
            Self::Offline
        }
    }

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
            status: AgentStatus,
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
            
            // Check if agent already exists
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
            
            // Create the agent info
            let agent_info = AgentInfo {
                pubkey: who.clone(),
                role: bounded_role,
                trust_score: 0,
                status: AgentStatus::Online, // New agents start as online
                registered_at: <frame_system::Pallet<T>>::block_number(),
                metadata: bounded_metadata,
            };
            
            // Store the agent
            Agents::<T>::insert(&who, agent_info);
            
            // Emit event
            Self::deposit_event(Event::AgentRegistered { 
                agent_id: who,
                role: role,
            });
            
            Ok(())
        }
        
        /// Update an agent's status
        ///
        /// The origin must be signed by the agent whose status is being updated.
        /// Parameters:
        /// - `status`: The new status to set
        #[pallet::call_index(1)]
        #[pallet::weight(Weight::from_parts(5_000, 0).saturating_add(T::DbWeight::get().reads_writes(1, 1)))]
        pub fn update_status(
            origin: OriginFor<T>,
            status: AgentStatus,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // Ensure agent exists
            Agents::<T>::try_mutate(&who, |maybe_agent| -> DispatchResult {
                let agent = maybe_agent.as_mut().ok_or(Error::<T>::AgentNotFound)?;
                
                // Update status
                agent.status = status.clone();
                
                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::AgentStatusUpdated { 
                agent_id: who,
                status,
            });
            
            Ok(())
        }
        
        /// Update an agent's metadata
        ///
        /// The origin must be signed by the agent whose metadata is being updated.
        /// Parameters:
        /// - `metadata`: The new metadata to set
        #[pallet::call_index(2)]
        #[pallet::weight(Weight::from_parts(8_000, 0).saturating_add(T::DbWeight::get().reads_writes(1, 1)))]
        pub fn update_metadata(
            origin: OriginFor<T>,
            metadata: Vec<u8>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // Ensure agent exists and update metadata
            Agents::<T>::try_mutate(&who, |maybe_agent| -> DispatchResult {
                let agent = maybe_agent.as_mut().ok_or(Error::<T>::AgentNotFound)?;
                
                // Validate and bound the metadata
                let bounded_metadata = BoundedVec::<u8, T::MaxMetadataLength>::try_from(metadata)
                    .map_err(|_| Error::<T>::InvalidMetadata)?;
                
                // Update metadata
                agent.metadata = Some(bounded_metadata);
                
                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::AgentMetadataUpdated { 
                agent_id: who,
            });
            
            Ok(())
        }
        
        /// Update an agent's trust score
        ///
        /// This function is meant to be called by authorized pallets (like a consensus pallet)
        /// but for simplicity in this example, we'll allow any agent to update their own score.
        /// In a production system, this would likely have additional access controls.
        ///
        /// Parameters:
        /// - `agent_id`: The ID of the agent whose score is being updated
        /// - `score_delta`: The amount to change the trust score by (positive or negative)
        #[pallet::call_index(3)]
        #[pallet::weight(Weight::from_parts(5_000, 0).saturating_add(T::DbWeight::get().reads_writes(1, 1)))]
        pub fn update_trust_score(
            origin: OriginFor<T>,
            agent_id: T::AccountId,
            score_delta: i64,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // For now, agents can only update their own score
            // In a real system, this would be controlled by a governance mechanism
            // or called from other pallets
            ensure!(who == agent_id, Error::<T>::AgentNotFound);
            
            // Ensure agent exists and update trust score
            Agents::<T>::try_mutate(&agent_id, |maybe_agent| -> DispatchResult {
                let agent = maybe_agent.as_mut().ok_or(Error::<T>::AgentNotFound)?;
                
                // Update trust score, ensuring it doesn't overflow or underflow
                if score_delta >= 0 {
                    agent.trust_score = agent.trust_score.saturating_add(score_delta as u64);
                } else {
                    agent.trust_score = agent.trust_score.saturating_sub((-score_delta) as u64);
                }
                
                Ok(())
            })?;
            
            // Get the new score for the event
            let new_score = Self::agents(&agent_id).ok_or(Error::<T>::AgentNotFound)?.trust_score;
            
            // Emit event
            Self::deposit_event(Event::TrustScoreUpdated { 
                agent_id: agent_id,
                new_score,
            });
            
            Ok(())
        }
    }
} 