/*
 * ----------------------------------------------------------------------------
 *  File:        lib.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Consensus and Insight Log pallet for C-Suite blockchain
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

//! # Consensus Log Pallet
//!
//! A pallet for storing consensus records, insights, and agent signatures for the C-Suite blockchain.
//!
//! ## Overview
//!
//! This pallet provides functionality to:
//! - Store consensus logs with unique identifiers
//! - Track agent signatures on consensus records
//! - Submit and verify collective insights from agents
//! - Query consensus history by agent or content identifier (CID)
//!
//! Each consensus log contains the participating agents, their signatures,
//! metadata about the consensus process, and IPFS content identifiers (CIDs)
//! for storing larger data off-chain.

#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;
pub mod aggregate;

use aggregate::{FrostAggregator, DefaultFrostConfig, AggregateSignature};

#[frame_support::pallet]
pub mod pallet {
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;
    use pallet_agent_registry::{self as agent_registry, AgentStatus};

    #[pallet::config]
    pub trait Config: frame_system::Config + agent_registry::Config {
        /// The overarching event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        
        /// Maximum length for CID (Content Identifier) strings
        #[pallet::constant]
        type MaxCIDLength: Get<u32>;
        
        /// Maximum length for metadata
        #[pallet::constant]
        type MaxMetadataLength: Get<u32>;
        
        /// Maximum number of agents that can be involved in a single consensus
        #[pallet::constant]
        type MaxAgentsInvolved: Get<u32>;
        
        /// Maximum length for signatures
        #[pallet::constant]
        type MaxSignatureLength: Get<u32> + Clone + Eq;
        
        /// Maximum number of signatures per consensus log
        #[pallet::constant]
        type MaxSignatures: Get<u32>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    /// Signature information for consensus logs
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct SignatureInfo<T: Config> {
        /// The agent who provided this signature
        pub agent_id: T::AccountId,
        /// The actual signature data
        pub signature: BoundedVec<u8, T::MaxSignatureLength>,
    }

    /// Consensus log data structure
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct ConsensusLog<T: Config> {
        /// When this consensus log was created
        pub timestamp: BlockNumberFor<T>,
        /// Content identifier (CID) for IPFS storage
        pub cid: BoundedVec<u8, T::MaxCIDLength>,
        /// List of agents involved in this consensus
        pub agents_involved: BoundedVec<T::AccountId, T::MaxAgentsInvolved>,
        /// Signatures from agents
        pub signatures: BoundedVec<SignatureInfo<T>, T::MaxSignatures>,
        /// Optional metadata about the consensus
        pub metadata: Option<BoundedVec<u8, <T as Config>::MaxMetadataLength>>,
    }

    /// Storage for all consensus logs
    #[pallet::storage]
    #[pallet::getter(fn logs)]
    pub type Logs<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::Hash,  // Log ID
        ConsensusLog<T>,
        OptionQuery,
    >;

    /// Index of logs by agent for quick lookup
    #[pallet::storage]
    #[pallet::getter(fn logs_by_agent)]
    pub type LogsByAgent<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,  // Agent ID
        BoundedVec<T::Hash, ConstU32<1000>>,  // List of log IDs (limited to 1000)
        ValueQuery,
    >;

    /// Index of logs by CID for content-based queries
    #[pallet::storage]
    #[pallet::getter(fn logs_by_cid)]
    pub type LogsByCID<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        BoundedVec<u8, T::MaxCIDLength>,  // CID
        BoundedVec<T::Hash, ConstU32<100>>,  // List of log IDs (limited to 100)
        ValueQuery,
    >;

    /// Events emitted by the pallet
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// A new consensus log was created
        ConsensusLogged {
            log_id: T::Hash,
            agent_id: T::AccountId,
            cid: Vec<u8>,
        },
        /// An insight was submitted to a consensus log
        InsightSubmitted {
            log_id: T::Hash,
            agent_id: T::AccountId,
            agents_involved: Vec<T::AccountId>,
        },
        /// A signature was added to a consensus log
        LogSigned {
            log_id: T::Hash,
            agent_id: T::AccountId,
        },
    }

    /// Errors that can occur in the pallet
    #[pallet::error]
    pub enum Error<T> {
        /// Agent is not registered or not active
        AgentNotFound,
        /// Agent is not currently active (offline or maintenance)
        AgentNotActive,
        /// Invalid CID format
        InvalidCID,
        /// Invalid signature format
        InvalidSignature,
        /// Invalid metadata format
        InvalidMetadata,
        /// Log with this ID already exists
        LogAlreadyExists,
        /// Log with this ID does not exist
        LogNotFound,
        /// Not enough agents for consensus (minimum 2 required)
        NotEnoughAgents,
        /// Agent has already signed this log
        AlreadySigned,
        /// Too many agents involved
        TooManyAgents,
        /// Signature list is full
        SignatureListFull,
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Submit a new consensus log
        ///
        /// Parameters:
        /// - `cid`: Content identifier for IPFS storage
        /// - `metadata`: Optional metadata about the consensus
        #[pallet::call_index(0)]
        #[pallet::weight(Weight::from_parts(10_000, 0).saturating_add(T::DbWeight::get().reads_writes(3, 3)))]
        pub fn submit_consensus_log(
            origin: OriginFor<T>,
            cid: Vec<u8>,
            metadata: Option<Vec<u8>>,
        ) -> DispatchResult {
            let agent_id = ensure_signed(origin)?;
            
            // Ensure agent exists and is active
            let agent = <agent_registry::Pallet<T>>::agents(&agent_id).ok_or(Error::<T>::AgentNotFound)?;
            ensure!(agent.status == AgentStatus::Online, Error::<T>::AgentNotActive);
            
            // Validate CID
            ensure!(!cid.is_empty(), Error::<T>::InvalidCID);
            let bounded_cid = BoundedVec::<u8, T::MaxCIDLength>::try_from(cid.clone())
                .map_err(|_| Error::<T>::InvalidCID)?;
                
            // Validate and bound the metadata if provided
            let bounded_metadata = if let Some(meta) = metadata {
                Some(BoundedVec::<u8, <T as Config>::MaxMetadataLength>::try_from(meta)
                    .map_err(|_| Error::<T>::InvalidMetadata)?)
            } else {
                None
            };
            
            // For initial submission, only the submitting agent is involved
            let mut agents_involved = BoundedVec::<T::AccountId, T::MaxAgentsInvolved>::default();
            let _ = agents_involved.try_push(agent_id.clone());
            
            // No signatures initially (will be added later via sign_log)
            let signatures = BoundedVec::<SignatureInfo<T>, T::MaxSignatures>::default();
            
            // Create the consensus log
            let consensus_log = ConsensusLog {
                timestamp: <frame_system::Pallet<T>>::block_number(),
                cid: bounded_cid.clone(),
                agents_involved,
                signatures,
                metadata: bounded_metadata,
            };
            
            // Generate a unique log ID by hashing the content
            let log_id = T::Hashing::hash_of(&consensus_log);
            
            // Ensure log doesn't already exist
            ensure!(!Logs::<T>::contains_key(&log_id), Error::<T>::LogAlreadyExists);
            
            // Store the consensus log
            Logs::<T>::insert(&log_id, consensus_log);
            
            // Update agent index
            LogsByAgent::<T>::try_mutate(&agent_id, |logs| -> DispatchResult {
                logs.try_push(log_id.clone()).map_err(|_| Error::<T>::TooManyAgents)?;
                Ok(())
            })?;
            
            // Update CID index
            LogsByCID::<T>::try_mutate(bounded_cid.clone(), |logs| -> DispatchResult {
                logs.try_push(log_id.clone()).map_err(|_| Error::<T>::TooManyAgents)?;
                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::ConsensusLogged {
                log_id,
                agent_id,
                cid,
            });
            
            Ok(())
        }
        
        /// Submit an insight with multiple agents involved
        ///
        /// Parameters:
        /// - `agents_involved`: List of agent IDs participating in this insight
        /// - `cid`: Content identifier for IPFS storage
        /// - `signature`: Digital signature from the submitting agent
        /// - `metadata`: Optional metadata about the insight
        #[pallet::call_index(1)]
        #[pallet::weight(Weight::from_parts(15_000, 0).saturating_add(T::DbWeight::get().reads_writes(5, 4)))]
        pub fn submit_insight(
            origin: OriginFor<T>,
            agents_involved: Vec<T::AccountId>,
            cid: Vec<u8>,
            signature: Vec<u8>,
            metadata: Option<Vec<u8>>,
        ) -> DispatchResult {
            let agent_id = ensure_signed(origin)?;
            
            // Ensure agent exists and is active
            let agent = <agent_registry::Pallet<T>>::agents(&agent_id).ok_or(Error::<T>::AgentNotFound)?;
            ensure!(agent.status == AgentStatus::Online, Error::<T>::AgentNotActive);
            
            // Validate inputs
            ensure!(agents_involved.len() >= 2, Error::<T>::NotEnoughAgents);
            
            // Validate CID
            ensure!(!cid.is_empty(), Error::<T>::InvalidCID);
            let bounded_cid = BoundedVec::<u8, T::MaxCIDLength>::try_from(cid.clone())
                .map_err(|_| Error::<T>::InvalidCID)?;
                
            // Validate signature
            ensure!(!signature.is_empty(), Error::<T>::InvalidSignature);
            let bounded_signature = BoundedVec::<u8, T::MaxSignatureLength>::try_from(signature)
                .map_err(|_| Error::<T>::InvalidSignature)?;
                
            // Validate and bound the metadata if provided
            let bounded_metadata = if let Some(meta) = metadata {
                Some(BoundedVec::<u8, <T as Config>::MaxMetadataLength>::try_from(meta)
                    .map_err(|_| Error::<T>::InvalidMetadata)?)
            } else {
                None
            };
            
            // Validate and bound agents involved
            let mut bounded_agents = BoundedVec::<T::AccountId, T::MaxAgentsInvolved>::default();
            for agent in &agents_involved {
                // Ensure each agent exists
                ensure!(<agent_registry::Pallet<T>>::agents(agent).is_some(), Error::<T>::AgentNotFound);
                bounded_agents.try_push(agent.clone()).map_err(|_| Error::<T>::TooManyAgents)?;
            }
            
            // Include the submitting agent if not already in the list
            if !bounded_agents.contains(&agent_id) {
                bounded_agents.try_push(agent_id.clone()).map_err(|_| Error::<T>::TooManyAgents)?;
            }
            
            // Create initial signatures with the submitting agent's signature
            let mut signatures = BoundedVec::<SignatureInfo<T>, T::MaxSignatures>::default();
            let sig_info = SignatureInfo {
                agent_id: agent_id.clone(),
                signature: bounded_signature,
            };
            signatures.try_push(sig_info).map_err(|_| Error::<T>::SignatureListFull)?;
            
            // Create the consensus log
            let consensus_log = ConsensusLog {
                timestamp: <frame_system::Pallet<T>>::block_number(),
                cid: bounded_cid.clone(),
                agents_involved: bounded_agents.clone(),
                signatures,
                metadata: bounded_metadata,
            };
            
            // Generate a unique log ID
            let log_id = T::Hashing::hash_of(&consensus_log);
            
            // Ensure log doesn't already exist
            ensure!(!Logs::<T>::contains_key(&log_id), Error::<T>::LogAlreadyExists);
            
            // Store the consensus log
            Logs::<T>::insert(&log_id, consensus_log);
            
            // Update agent indices for all involved agents
            for agent in &bounded_agents {
                LogsByAgent::<T>::try_mutate(agent, |logs| -> DispatchResult {
                    logs.try_push(log_id.clone()).map_err(|_| Error::<T>::TooManyAgents)?;
                    Ok(())
                })?;
            }
            
            // Update CID index
            LogsByCID::<T>::try_mutate(bounded_cid, |logs| -> DispatchResult {
                logs.try_push(log_id.clone()).map_err(|_| Error::<T>::TooManyAgents)?;
                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::InsightSubmitted {
                log_id,
                agent_id,
                agents_involved,
            });
            
            Ok(())
        }
        
        /// Sign an existing consensus log
        ///
        /// Parameters:
        /// - `log_id`: The ID of the log to sign
        /// - `signature`: Digital signature from the agent
        #[pallet::call_index(2)]
        #[pallet::weight(Weight::from_parts(8_000, 0).saturating_add(T::DbWeight::get().reads_writes(2, 1)))]
        pub fn sign_log(
            origin: OriginFor<T>,
            log_id: T::Hash,
            signature: Vec<u8>,
        ) -> DispatchResult {
            let agent_id = ensure_signed(origin)?;
            
            // Ensure agent exists and is active
            let agent = <agent_registry::Pallet<T>>::agents(&agent_id).ok_or(Error::<T>::AgentNotFound)?;
            ensure!(agent.status == AgentStatus::Online, Error::<T>::AgentNotActive);
            
            // Validate signature
            ensure!(!signature.is_empty(), Error::<T>::InvalidSignature);
            let bounded_signature = BoundedVec::<u8, T::MaxSignatureLength>::try_from(signature)
                .map_err(|_| Error::<T>::InvalidSignature)?;
            
            // Update the log with the new signature
            Logs::<T>::try_mutate(&log_id, |maybe_log| -> DispatchResult {
                let log = maybe_log.as_mut().ok_or(Error::<T>::LogNotFound)?;
                
                // Ensure agent is involved in this consensus
                ensure!(log.agents_involved.contains(&agent_id), Error::<T>::AgentNotFound);
                
                // Ensure agent hasn't already signed
                ensure!(!log.signatures.iter().any(|s| s.agent_id == agent_id), Error::<T>::AlreadySigned);
                
                // Add the signature
                let sig_info = SignatureInfo {
                    agent_id: agent_id.clone(),
                    signature: bounded_signature,
                };
                log.signatures.try_push(sig_info).map_err(|_| Error::<T>::SignatureListFull)?;
                
                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::LogSigned {
                log_id,
                agent_id,
            });
            
            Ok(())
        }
    }
} 