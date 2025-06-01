/*
 * ----------------------------------------------------------------------------
 *  File:        lib.rs
 *  Project:     Celaya Solutions (C-Suite Blockchain)
 *  Created by:  Celaya Solutions, 2025
 *  Author:      Christopher Celaya <chris@celayasolutions.com>
 *  Description: Recall pallet for storing consensus records and insight logs
 *  Version:     1.0.0
 *  License:     BSL (SPDX id BUSL)
 *  Last Update: (May 2025)
 * ----------------------------------------------------------------------------
 */

//! # Recall Pallet
//!
//! A pallet for storing consensus records and insight logs from C-Suite agents.
//!
//! ## Overview
//!
//! This pallet provides functionality to:
//! - Store consensus records from agent insights
//! - Track IPFS content identifiers (CIDs) for off-chain data
//! - Manage agent signatures and verification
//! - Query historical records and insights
//!
//! Each record in the Recall system contains:
//! - Content hash for integrity verification
//! - IPFS CID for decentralized storage
//! - Agent signatures for authenticity
//! - Metadata about the insight or consensus

#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;
    use sp_runtime::traits::{Saturating, Zero};

    #[pallet::config]
    pub trait Config: frame_system::Config {
        /// The overarching event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        
        /// Maximum length for content hash
        #[pallet::constant]
        type MaxContentHashLength: Get<u32>;
        
        /// Maximum length for IPFS CID
        #[pallet::constant]
        type MaxIpfsCidLength: Get<u32>;
        
        /// Maximum length for insight summary
        #[pallet::constant]
        type MaxSummaryLength: Get<u32>;
        
        /// Maximum length for metadata
        #[pallet::constant]
        type MaxMetadataLength: Get<u32>;
        
        /// Maximum number of agent signatures per record
        #[pallet::constant]
        type MaxSignatures: Get<u32>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    /// Record type enum
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    pub enum RecordType {
        /// Single agent insight (e.g., Beacon knowledge retrieval)
        SingleAgentInsight,
        /// Multi-agent consensus (e.g., Theory + Beacon + Verdict)
        MultiAgentConsensus,
        /// System event log
        SystemEvent,
        /// Agent status update
        AgentStatusUpdate,
    }

    impl Default for RecordType {
        fn default() -> Self {
            Self::SingleAgentInsight
        }
    }

    /// Agent signature for a record
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct AgentSignature<T: Config> {
        /// The agent that signed this record
        pub agent_id: T::AccountId,
        /// The signature data (simplified as hash for now)
        pub signature: BoundedVec<u8, T::MaxContentHashLength>,
        /// When this signature was created
        pub signed_at: BlockNumberFor<T>,
    }

    /// A consensus record stored on-chain
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct ConsensusRecord<T: Config> {
        /// Type of record
        pub record_type: RecordType,
        /// Hash of the content for integrity verification
        pub content_hash: BoundedVec<u8, T::MaxContentHashLength>,
        /// IPFS CID where full content is stored
        pub ipfs_cid: BoundedVec<u8, T::MaxIpfsCidLength>,
        /// Brief summary of the insight/consensus
        pub summary: BoundedVec<u8, T::MaxSummaryLength>,
        /// Agent signatures (at least one required)
        pub signatures: BoundedVec<AgentSignature<T>, T::MaxSignatures>,
        /// When this record was created
        pub created_at: BlockNumberFor<T>,
        /// Optional metadata (JSON-encoded additional info)
        pub metadata: Option<BoundedVec<u8, T::MaxMetadataLength>>,
        /// Trust score calculated from participating agents
        pub trust_score: u64,
    }

    /// Storage for all consensus records
    #[pallet::storage]
    #[pallet::getter(fn records)]
    pub type Records<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        u64,  // Record ID (auto-incrementing)
        ConsensusRecord<T>,
        OptionQuery,
    >;

    /// Next available record ID
    #[pallet::storage]
    #[pallet::getter(fn next_record_id)]
    pub type NextRecordId<T: Config> = StorageValue<_, u64, ValueQuery>;

    /// Index mapping content hash to record ID
    #[pallet::storage]
    #[pallet::getter(fn content_hash_to_record)]
    pub type ContentHashToRecord<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        BoundedVec<u8, T::MaxContentHashLength>,
        u64,
        OptionQuery,
    >;

    /// Index mapping agent to their record IDs
    #[pallet::storage]
    #[pallet::getter(fn agent_records)]
    pub type AgentRecords<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        BoundedVec<u64, ConstU32<1000>>,  // Max 1000 records per agent for storage efficiency
        ValueQuery,
    >;

    /// Events emitted by the pallet
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// A new consensus record was stored
        ConsensusRecordStored {
            record_id: u64,
            record_type: RecordType,
            content_hash: Vec<u8>,
            ipfs_cid: Vec<u8>,
        },
        /// An agent signature was added to a record
        SignatureAdded {
            record_id: u64,
            agent_id: T::AccountId,
        },
        /// A record's trust score was updated
        TrustScoreUpdated {
            record_id: u64,
            new_score: u64,
        },
    }

    /// Errors that can occur in the pallet
    #[pallet::error]
    pub enum Error<T> {
        /// Record not found
        RecordNotFound,
        /// Invalid content hash format
        InvalidContentHash,
        /// Invalid IPFS CID format
        InvalidIpfsCid,
        /// No signatures provided
        NoSignatures,
        /// Too many signatures
        TooManySignatures,
        /// Agent already signed this record
        AgentAlreadySigned,
        /// Invalid record type
        InvalidRecordType,
        /// Summary too long
        SummaryTooLong,
        /// Metadata too long
        MetadataTooLong,
        /// Content hash already exists (duplicate record)
        DuplicateRecord,
        /// Agent records list is full
        AgentRecordsListFull,
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Store a new consensus record
        ///
        /// Parameters:
        /// - `record_type`: The type of record being stored
        /// - `content_hash`: Hash of the content for integrity
        /// - `ipfs_cid`: IPFS content identifier where full data is stored
        /// - `summary`: Brief summary of the insight
        /// - `metadata`: Optional additional metadata
        #[pallet::call_index(0)]
        #[pallet::weight(Weight::from_parts(10_000, 0).saturating_add(T::DbWeight::get().reads_writes(3, 4)))]
        pub fn store_consensus_record(
            origin: OriginFor<T>,
            record_type: RecordType,
            content_hash: Vec<u8>,
            ipfs_cid: Vec<u8>,
            summary: Vec<u8>,
            signature: Vec<u8>,
            metadata: Option<Vec<u8>>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // Validate inputs
            ensure!(!content_hash.is_empty(), Error::<T>::InvalidContentHash);
            ensure!(!ipfs_cid.is_empty(), Error::<T>::InvalidIpfsCid);
            ensure!(!signature.is_empty(), Error::<T>::NoSignatures);
            
            // Bound the inputs
            let bounded_content_hash = BoundedVec::<u8, T::MaxContentHashLength>::try_from(content_hash.clone())
                .map_err(|_| Error::<T>::InvalidContentHash)?;
            let bounded_ipfs_cid = BoundedVec::<u8, T::MaxIpfsCidLength>::try_from(ipfs_cid.clone())
                .map_err(|_| Error::<T>::InvalidIpfsCid)?;
            let bounded_summary = BoundedVec::<u8, T::MaxSummaryLength>::try_from(summary)
                .map_err(|_| Error::<T>::SummaryTooLong)?;
            let bounded_signature = BoundedVec::<u8, T::MaxContentHashLength>::try_from(signature)
                .map_err(|_| Error::<T>::NoSignatures)?;
            let bounded_metadata = if let Some(meta) = metadata {
                Some(BoundedVec::<u8, T::MaxMetadataLength>::try_from(meta)
                    .map_err(|_| Error::<T>::MetadataTooLong)?)
            } else {
                None
            };
            
            // Check for duplicate content hash
            ensure!(
                !ContentHashToRecord::<T>::contains_key(&bounded_content_hash),
                Error::<T>::DuplicateRecord
            );
            
            // Get next record ID
            let record_id = NextRecordId::<T>::get();
            
            // Create agent signature
            let agent_signature = AgentSignature {
                agent_id: who.clone(),
                signature: bounded_signature,
                signed_at: <frame_system::Pallet<T>>::block_number(),
            };
            
            let mut signatures = BoundedVec::new();
            signatures.try_push(agent_signature)
                .map_err(|_| Error::<T>::TooManySignatures)?;
            
            // Create the record
            let record = ConsensusRecord {
                record_type: record_type.clone(),
                content_hash: bounded_content_hash.clone(),
                ipfs_cid: bounded_ipfs_cid,
                summary: bounded_summary,
                signatures,
                created_at: <frame_system::Pallet<T>>::block_number(),
                metadata: bounded_metadata,
                trust_score: 100, // Initial trust score
            };
            
            // Store the record
            Records::<T>::insert(&record_id, &record);
            
            // Update indexes
            ContentHashToRecord::<T>::insert(&bounded_content_hash, &record_id);
            
            // Update agent records
            AgentRecords::<T>::try_mutate(&who, |records| {
                records.try_push(record_id)
            }).map_err(|_| Error::<T>::AgentRecordsListFull)?;
            
            // Increment next record ID
            NextRecordId::<T>::put(record_id.saturating_add(1));
            
            // Emit event
            Self::deposit_event(Event::ConsensusRecordStored {
                record_id,
                record_type,
                content_hash,
                ipfs_cid: bounded_ipfs_cid.into(),
            });
            
            Ok(())
        }

        /// Add an additional agent signature to an existing record
        ///
        /// Parameters:
        /// - `record_id`: The ID of the record to sign
        /// - `signature`: The agent's signature
        #[pallet::call_index(1)]
        #[pallet::weight(Weight::from_parts(10_000, 0).saturating_add(T::DbWeight::get().reads_writes(2, 2)))]
        pub fn add_signature(
            origin: OriginFor<T>,
            record_id: u64,
            signature: Vec<u8>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            
            // Validate signature
            ensure!(!signature.is_empty(), Error::<T>::NoSignatures);
            let bounded_signature = BoundedVec::<u8, T::MaxContentHashLength>::try_from(signature)
                .map_err(|_| Error::<T>::NoSignatures)?;
            
            // Get the record
            let mut record = Records::<T>::get(&record_id)
                .ok_or(Error::<T>::RecordNotFound)?;
            
            // Check if agent already signed
            ensure!(
                !record.signatures.iter().any(|sig| sig.agent_id == who),
                Error::<T>::AgentAlreadySigned
            );
            
            // Create new signature
            let agent_signature = AgentSignature {
                agent_id: who.clone(),
                signature: bounded_signature,
                signed_at: <frame_system::Pallet<T>>::block_number(),
            };
            
            // Add signature to record
            record.signatures.try_push(agent_signature)
                .map_err(|_| Error::<T>::TooManySignatures)?;
            
            // Update trust score based on number of signatures
            record.trust_score = record.trust_score.saturating_add(50);
            
            // Store updated record
            Records::<T>::insert(&record_id, &record);
            
            // Update agent records
            AgentRecords::<T>::try_mutate(&who, |records| {
                if !records.contains(&record_id) {
                    records.try_push(record_id)
                } else {
                    Ok(())
                }
            }).map_err(|_| Error::<T>::AgentRecordsListFull)?;
            
            // Emit events
            Self::deposit_event(Event::SignatureAdded {
                record_id,
                agent_id: who,
            });
            
            Self::deposit_event(Event::TrustScoreUpdated {
                record_id,
                new_score: record.trust_score,
            });
            
            Ok(())
        }

        /// Update the trust score of a record (governance function)
        ///
        /// Parameters:
        /// - `record_id`: The ID of the record to update
        /// - `new_score`: The new trust score
        #[pallet::call_index(2)]
        #[pallet::weight(Weight::from_parts(10_000, 0).saturating_add(T::DbWeight::get().reads_writes(1, 1)))]
        pub fn update_trust_score(
            origin: OriginFor<T>,
            record_id: u64,
            new_score: u64,
        ) -> DispatchResult {
            ensure_root(origin)?;
            
            // Get and update the record
            Records::<T>::try_mutate(&record_id, |record| {
                let mut rec = record.as_mut().ok_or(Error::<T>::RecordNotFound)?;
                rec.trust_score = new_score;
                Ok(())
            })?;
            
            // Emit event
            Self::deposit_event(Event::TrustScoreUpdated {
                record_id,
                new_score,
            });
            
            Ok(())
        }
    }

    // Helper functions
    impl<T: Config> Pallet<T> {
        /// Get record by content hash
        pub fn get_record_by_hash(content_hash: &[u8]) -> Option<(u64, ConsensusRecord<T>)> {
            let bounded_hash = BoundedVec::<u8, T::MaxContentHashLength>::try_from(content_hash.to_vec()).ok()?;
            let record_id = ContentHashToRecord::<T>::get(&bounded_hash)?;
            let record = Records::<T>::get(&record_id)?;
            Some((record_id, record))
        }
        
        /// Get all records by an agent
        pub fn get_agent_records(agent_id: &T::AccountId) -> Vec<(u64, ConsensusRecord<T>)> {
            let record_ids = AgentRecords::<T>::get(agent_id);
            record_ids.iter()
                .filter_map(|&id| Records::<T>::get(&id).map(|record| (id, record)))
                .collect()
        }
        
        /// Get records by type
        pub fn get_records_by_type(record_type: RecordType) -> Vec<(u64, ConsensusRecord<T>)> {
            Records::<T>::iter()
                .filter(|(_, record)| record.record_type == record_type)
                .collect()
        }
        
        /// Get latest N records
        pub fn get_latest_records(count: u32) -> Vec<(u64, ConsensusRecord<T>)> {
            let next_id = NextRecordId::<T>::get();
            let start_id = if next_id > count as u64 { next_id - count as u64 } else { 0 };
            
            (start_id..next_id)
                .filter_map(|id| Records::<T>::get(&id).map(|record| (id, record)))
                .collect()
        }
    }
} 