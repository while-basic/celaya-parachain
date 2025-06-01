/*
 * ----------------------------------------------------------------------------
 *  File:        lib.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Consensus Log pallet for C-Suite blockchain
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

//! # Consensus Log Pallet
//!
//! A pallet for managing consensus logs in the C-Suite blockchain.
//!
//! ## Overview
//!
//! This pallet provides functionality to:
//! - Submit consensus logs with insights and decisions
//! - Sign consensus logs to verify participation
//! - Track consensus participation and finalize logs
//! - Interface with agent registry for trust score updates
//!
//! The consensus process involves multiple C-Suite agents collaborating on
//! executive decisions and logging their insights on-chain for transparency.

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
    use alloc::vec::Vec;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        /// The overarching event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        
        /// Maximum length for CID string
        #[pallet::constant]
        type MaxCIDLength: Get<u32>;
        
        /// Maximum length for metadata
        #[pallet::constant]
        type MaxMetadataLength: Get<u32>;
        
        /// Maximum number of agents involved in a consensus
        #[pallet::constant]
        type MaxAgentsInvolved: Get<u32>;
        
        /// Maximum length for a signature
        #[pallet::constant]
        type MaxSignatureLength: Get<u32>;
        
        /// Maximum number of signatures per log
        #[pallet::constant]
        type MaxSignatures: Get<u32>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    /// Status of a consensus log
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    pub enum ConsensusStatus {
        /// Log is pending signatures
        Pending,
        /// Log has been signed and is active
        Active,
        /// Log has been finalized
        Finalized,
        /// Log has been rejected
        Rejected,
    }

    impl Default for ConsensusStatus {
        fn default() -> Self {
            Self::Pending
        }
    }

    /// A signature from an agent (simplified)
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct AgentSignature<T: Config> 
    where 
        T::AccountId: Clone + PartialEq + Eq + core::fmt::Debug,
    {
        /// The agent who signed
        pub agent_id: T::AccountId,
        /// The signature data (fixed size for simplicity)
        pub signature: [u8; 64],
        /// When the signature was created
        pub signed_at: BlockNumberFor<T>,
    }

    /// A consensus log entry (simplified)
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct ConsensusLog<T: Config> 
    where 
        T::AccountId: Clone + PartialEq + Eq + core::fmt::Debug,
    {
        /// Content identifier (IPFS hash or similar) - fixed size
        pub cid: [u8; 64],
        /// The agent who submitted this log
        pub submitter: T::AccountId,
        /// List of agents involved in this consensus
        pub agents_involved: BoundedVec<T::AccountId, T::MaxAgentsInvolved>,
        /// Signatures from participating agents
        pub signatures: BoundedVec<AgentSignature<T>, T::MaxSignatures>,
        /// Current status of the log
        pub status: ConsensusStatus,
        /// When the log was created
        pub created_at: BlockNumberFor<T>,
        /// When the log was last updated
        pub updated_at: BlockNumberFor<T>,
        /// Optional metadata (fixed size)
        pub metadata: Option<[u8; 256]>,
    }

    /// Storage for consensus logs
    #[pallet::storage]
    #[pallet::getter(fn consensus_logs)]
    pub type ConsensusLogs<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        u32,  // Changed from u64 to u32
        ConsensusLog<T>,
    >;

    /// Next available log ID
    #[pallet::storage]
    #[pallet::getter(fn next_log_id)]
    pub type NextLogId<T: Config> = StorageValue<_, u32, ValueQuery>;

    /// Events emitted by the pallet
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// A new consensus log was submitted
        ConsensusLogSubmitted {
            log_id: u64,
            submitter: T::AccountId,
            cid: Vec<u8>,
        },
        /// A consensus log was signed
        ConsensusLogSigned {
            log_id: u64,
            signer: T::AccountId,
        },
        /// A consensus log was finalized
        ConsensusLogFinalized {
            log_id: u64,
        },
        /// A consensus log was rejected
        ConsensusLogRejected {
            log_id: u64,
        },
    }

    /// Errors that can occur in the pallet
    #[pallet::error]
    pub enum Error<T> {
        /// Consensus log not found
        LogNotFound,
        /// Agent not found in registry
        AgentNotFound,
        /// Agent not involved in this consensus
        AgentNotInvolved,
        /// Agent already signed this log
        AlreadySigned,
        /// Invalid CID format
        InvalidCID,
        /// Invalid metadata format
        InvalidMetadata,
        /// Too many agents involved
        TooManyAgents,
        /// Too many signatures
        TooManySignatures,
        /// Log is not in the correct status for this operation
        InvalidStatus,
        /// Agent is not active
        AgentNotActive,
        /// CID length too long
        CIDTooLong,
        /// Metadata length too long
        MetadataTooLong,
        /// Invalid signature length
        InvalidSignature,
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Submit a new consensus log
        ///
        /// Parameters:
        /// - `cid`: Content identifier for the log data
        /// - `agents_involved`: List of agents participating in this consensus
        /// - `metadata`: Optional metadata about the consensus
        #[pallet::call_index(0)]
        #[pallet::weight(Weight::from_parts(25_000, 0).saturating_add(T::DbWeight::get().reads_writes(10, 2)))]
        pub fn submit_consensus_log(
            origin: OriginFor<T>,
            cid: Vec<u8>,
            agents_involved: Vec<T::AccountId>,
            metadata: Option<Vec<u8>>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // Validate CID length
            ensure!(cid.len() <= 64, Error::<T>::CIDTooLong);
            
            // Validate agents involved
            let bounded_agents: BoundedVec<T::AccountId, T::MaxAgentsInvolved> = 
                agents_involved.try_into().map_err(|_| Error::<T>::TooManyAgents)?;
            
            // Validate metadata if provided
            let bounded_metadata = if let Some(meta) = metadata {
                ensure!(meta.len() <= 256, Error::<T>::MetadataTooLong);
                let mut fixed_meta = [0u8; 256];
                fixed_meta[..meta.len()].copy_from_slice(&meta);
                Some(fixed_meta)
            } else {
                None
            };
            
            // Convert CID to fixed array
            let mut fixed_cid = [0u8; 64];
            fixed_cid[..cid.len()].copy_from_slice(&cid);
            
            // Get next log ID
            let log_id = NextLogId::<T>::get();
            
            // Create consensus log
            let consensus_log = ConsensusLog {
                cid: fixed_cid,
                submitter: who.clone(),
                agents_involved: bounded_agents,
                signatures: BoundedVec::new(),
                status: ConsensusStatus::Pending,
                created_at: <frame_system::Pallet<T>>::block_number(),
                updated_at: <frame_system::Pallet<T>>::block_number(),
                metadata: bounded_metadata,
            };
            
            // Store the log
            ConsensusLogs::<T>::insert(&log_id, consensus_log);
            
            // Increment next log ID
            NextLogId::<T>::put(log_id + 1);
            
            // Emit event
            Self::deposit_event(Event::ConsensusLogSubmitted {
                log_id: log_id as u64,
                submitter: who,
                cid,
            });
            
            Ok(())
        }
        
        /// Sign a consensus log
        ///
        /// Parameters:
        /// - `log_id`: ID of the log to sign
        /// - `signature`: The signature data
        #[pallet::call_index(1)]
        #[pallet::weight(Weight::from_parts(15_000, 0).saturating_add(T::DbWeight::get().reads_writes(2, 1)))]
        pub fn sign_consensus_log(
            origin: OriginFor<T>,
            log_id: u32,
            signature: Vec<u8>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            // Validate signature length
            ensure!(signature.len() <= 64, Error::<T>::InvalidSignature);
            
            // Convert to fixed array
            let mut fixed_signature = [0u8; 64];
            fixed_signature[..signature.len()].copy_from_slice(&signature);

            // Update the consensus log
            ConsensusLogs::<T>::try_mutate(&log_id, |maybe_log| -> DispatchResult {
                let log = maybe_log.as_mut().ok_or(Error::<T>::LogNotFound)?;

                // Check if agent is involved in this consensus
                ensure!(
                    log.agents_involved.contains(&who),
                    Error::<T>::AgentNotInvolved
                );

                // Check if agent already signed
                ensure!(
                    !log.signatures.iter().any(|sig| sig.agent_id == who),
                    Error::<T>::AlreadySigned
                );

                // Create signature
                let agent_signature = AgentSignature {
                    agent_id: who.clone(),
                    signature: fixed_signature,
                    signed_at: <frame_system::Pallet<T>>::block_number(),
                };

                // Add signature
                log.signatures.try_push(agent_signature)
                    .map_err(|_| Error::<T>::TooManySignatures)?;

                // Update timestamp
                log.updated_at = <frame_system::Pallet<T>>::block_number();

                // Check if we have enough signatures to finalize
                if log.signatures.len() >= log.agents_involved.len() {
                    log.status = ConsensusStatus::Finalized;
                }

                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::ConsensusLogSigned {
                log_id: log_id as u64,
                signer: who,
            });
            
            Ok(())
        }
        
        /// Finalize a consensus log
        ///
        /// Parameters:
        /// - `log_id`: ID of the log to finalize
        #[pallet::call_index(2)]
        #[pallet::weight(Weight::from_parts(10_000, 0).saturating_add(T::DbWeight::get().reads_writes(1, 1)))]
        pub fn finalize_consensus_log(
            origin: OriginFor<T>,
            log_id: u32,
        ) -> DispatchResult {
            ensure_root(origin)?; // Only root can finalize (or governance)
            
            // Update log status
            ConsensusLogs::<T>::try_mutate(&log_id, |maybe_log| -> DispatchResult {
                let log = maybe_log.as_mut().ok_or(Error::<T>::LogNotFound)?;
                
                // Check status
                ensure!(log.status == ConsensusStatus::Active, Error::<T>::InvalidStatus);
                
                // Update status and timestamp
                log.status = ConsensusStatus::Finalized;
                log.updated_at = <frame_system::Pallet<T>>::block_number();
                
                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::ConsensusLogFinalized { log_id: log_id as u64 });
            
            Ok(())
        }
    }
    
    // Helper functions
    impl<T: Config> Pallet<T> {
        /// Get consensus log by ID
        pub fn get_consensus_log(log_id: u32) -> Option<ConsensusLog<T>> {
            ConsensusLogs::<T>::get(log_id)
        }
        
        /// Check if agent has signed a log
        pub fn has_agent_signed(log_id: u32, agent_id: &T::AccountId) -> bool {
            if let Some(log) = ConsensusLogs::<T>::get(log_id) {
                log.signatures.iter().any(|sig| sig.agent_id == *agent_id)
            } else {
                false
            }
        }
        
        /// Get logs by status
        pub fn get_logs_by_status(status: ConsensusStatus) -> Vec<(u32, ConsensusLog<T>)> {
            ConsensusLogs::<T>::iter()
                .filter_map(|(log_id, log)| {
                    if log.status == status {
                        Some((log_id, log))
                    } else {
                        None
                    }
                })
                .collect()
        }
    }
} 