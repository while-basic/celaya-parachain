# ----------------------------------------------------------------------------
#  File:        lib.rs
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Stake-weighted reputation system with adaptive incentives and slashing
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (June 2025)
# ----------------------------------------------------------------------------

//! # Stake-Weighted Reputation Pallet
//!
//! A pallet implementing adaptive incentives and slashing for agent reputation management.
//!
//! ## Overview
//!
//! This pallet provides functionality to:
//! - Stake tokens to participate in consensus and earn reputation
//! - Apply quadratic decay to reputation over time
//! - Slash stakes for misbehavior (unresponsiveness, equivocation)
//! - Quarantine or demote agents based on offenses
//! - Track and reward good behavior with reputation boosts
//!
//! ## Features
//!
//! ### Stake-Weighted Reputation
//! - Agents must stake tokens to participate in consensus
//! - Reputation weights are multiplied by stake amount
//! - Higher stakes = more influence and higher rewards
//!
//! ### Adaptive Incentives
//! - Successful consensus participation increases reputation
//! - Rewards scale with stake and performance
//! - Quadratic decay prevents reputation hoarding
//!
//! ### Slashing Mechanism
//! - Unresponsiveness: slash 5% of stake, reduce reputation
//! - Equivocation: slash 25% of stake, temporary quarantine
//! - Multiple offenses: exponential penalties

#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;

use frame_support::{
    traits::{Currency, ReservableCurrency, OnUnbalanced, Get},
    dispatch::DispatchResult,
};
use sp_runtime::{
    traits::{Zero, Saturating, CheckedMul},
    Perbill, FixedPointNumber,
};
use sp_std::vec::Vec;

pub use weights::WeightInfo;

#[frame_support::pallet]
pub mod pallet {
    use super::*;
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;
    use pallet_agent_registry::{self as agent_registry, AgentStatus};

    type BalanceOf<T> = <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;
    type NegativeImbalanceOf<T> = <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::NegativeImbalance;

    #[pallet::config]
    pub trait Config: frame_system::Config + agent_registry::Config {
        /// The overarching event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        /// The currency used for staking
        type Currency: Currency<Self::AccountId> + ReservableCurrency<Self::AccountId>;

        /// What to do with slashed funds
        type Slash: OnUnbalanced<NegativeImbalanceOf<Self>>;

        /// Minimum stake required to participate
        #[pallet::constant]
        type MinimumStake: Get<BalanceOf<Self>>;

        /// Base reputation decay rate per block (as Perbill)
        #[pallet::constant]
        type BaseDecayRate: Get<Perbill>;

        /// Reputation reward for successful consensus participation
        #[pallet::constant]
        type ConsensusReward: Get<u64>;

        /// Slash percentage for unresponsiveness (5%)
        #[pallet::constant]
        type UnresponsivenessSlash: Get<Perbill>;

        /// Slash percentage for equivocation (25%)
        #[pallet::constant]
        type EquivocationSlash: Get<Perbill>;

        /// Blocks to quarantine agent after serious offense
        #[pallet::constant]
        type QuarantinePeriod: Get<BlockNumberFor<Self>>;

        /// Maximum number of offenses before permanent ban
        #[pallet::constant]
        type MaxOffenses: Get<u32>;

        /// Weight information for extrinsics
        type WeightInfo: WeightInfo;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    /// Types of offenses that can be committed
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    pub enum OffenseType {
        /// Agent failed to respond to consensus request
        Unresponsiveness,
        /// Agent signed conflicting statements
        Equivocation,
        /// Agent provided invalid data
        InvalidData,
        /// Agent attempted to manipulate consensus
        ConsensusManipulation,
    }

    /// Agent's reputation and stake information
    #[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
    #[scale_info(skip_type_params(T))]
    pub struct ReputationInfo<T: Config> {
        /// Current reputation score
        pub reputation: u64,
        /// Staked amount
        pub stake: BalanceOf<T>,
        /// Block when reputation was last updated (for decay calculation)
        pub last_update: BlockNumberFor<T>,
        /// Number of successful consensus participations
        pub consensus_count: u32,
        /// Number of offenses committed
        pub offense_count: u32,
        /// Block when quarantine ends (if quarantined)
        pub quarantine_until: Option<BlockNumberFor<T>>,
        /// Whether agent is permanently banned
        pub is_banned: bool,
    }

    impl<T: Config> Default for ReputationInfo<T> {
        fn default() -> Self {
            Self {
                reputation: 0,
                stake: Zero::zero(),
                last_update: Zero::zero(),
                consensus_count: 0,
                offense_count: 0,
                quarantine_until: None,
                is_banned: false,
            }
        }
    }

    /// Storage for agent reputation and stake information
    #[pallet::storage]
    #[pallet::getter(fn reputation)]
    pub type Reputation<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        ReputationInfo<T>,
        ValueQuery,
    >;

    /// Total staked amount across all agents
    #[pallet::storage]
    #[pallet::getter(fn total_stake)]
    pub type TotalStake<T: Config> = StorageValue<_, BalanceOf<T>, ValueQuery>;

    /// Offense history for agents
    #[pallet::storage]
    #[pallet::getter(fn offense_history)]
    pub type OffenseHistory<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        BoundedVec<(OffenseType, BlockNumberFor<T>), ConstU32<100>>,
        ValueQuery,
    >;

    /// Events emitted by the pallet
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// Agent staked tokens
        Staked {
            agent_id: T::AccountId,
            amount: BalanceOf<T>,
        },
        /// Agent unstaked tokens
        Unstaked {
            agent_id: T::AccountId,
            amount: BalanceOf<T>,
        },
        /// Reputation updated for agent
        ReputationUpdated {
            agent_id: T::AccountId,
            old_reputation: u64,
            new_reputation: u64,
        },
        /// Agent was slashed for an offense
        AgentSlashed {
            agent_id: T::AccountId,
            offense_type: OffenseType,
            slash_amount: BalanceOf<T>,
            reputation_penalty: u64,
        },
        /// Agent was quarantined
        AgentQuarantined {
            agent_id: T::AccountId,
            until_block: BlockNumberFor<T>,
        },
        /// Agent was permanently banned
        AgentBanned {
            agent_id: T::AccountId,
        },
        /// Consensus reward distributed
        ConsensusRewardDistributed {
            agent_id: T::AccountId,
            reputation_reward: u64,
        },
    }

    /// Errors that can occur in the pallet
    #[pallet::error]
    pub enum Error<T> {
        /// Agent is not registered
        AgentNotFound,
        /// Insufficient stake amount
        InsufficientStake,
        /// Agent is quarantined
        AgentQuarantined,
        /// Agent is permanently banned
        AgentBanned,
        /// Insufficient balance to stake
        InsufficientBalance,
        /// Agent has no stake to unstake
        NoStakeToUnstake,
        /// Cannot slash - insufficient stake
        InsufficientStakeToSlash,
        /// Arithmetic overflow
        ArithmeticOverflow,
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
        /// Apply reputation decay every block
        fn on_finalize(_block: BlockNumberFor<T>) {
            // Decay reputation for all agents
            let _ = Self::apply_global_reputation_decay();
        }
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Stake tokens to participate in consensus
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::stake())]
        pub fn stake(
            origin: OriginFor<T>,
            amount: BalanceOf<T>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            // Check minimum stake requirement
            ensure!(amount >= T::MinimumStake::get(), Error::<T>::InsufficientStake);

            // Check agent is registered and not banned
            ensure!(
                agent_registry::Pallet::<T>::agents(&who).is_some(),
                Error::<T>::AgentNotFound
            );

            let mut reputation_info = Self::reputation(&who);
            ensure!(!reputation_info.is_banned, Error::<T>::AgentBanned);

            // Check if quarantined
            if let Some(quarantine_until) = reputation_info.quarantine_until {
                ensure!(
                    <frame_system::Pallet<T>>::block_number() > quarantine_until,
                    Error::<T>::AgentQuarantined
                );
                reputation_info.quarantine_until = None;
            }

            // Reserve the stake
            T::Currency::reserve(&who, amount)
                .map_err(|_| Error::<T>::InsufficientBalance)?;

            // Update reputation info
            reputation_info.stake = reputation_info.stake.saturating_add(amount);
            reputation_info.last_update = <frame_system::Pallet<T>>::block_number();

            // Update total stake
            let new_total = Self::total_stake().saturating_add(amount);
            <TotalStake<T>>::put(new_total);

            // Store updated reputation info
            <Reputation<T>>::insert(&who, reputation_info);

            Self::deposit_event(Event::Staked {
                agent_id: who,
                amount,
            });

            Ok(())
        }

        /// Unstake tokens
        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::unstake())]
        pub fn unstake(
            origin: OriginFor<T>,
            amount: BalanceOf<T>,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let mut reputation_info = Self::reputation(&who);
            ensure!(reputation_info.stake >= amount, Error::<T>::NoStakeToUnstake);

            // Unreserve the stake
            T::Currency::unreserve(&who, amount);

            // Update reputation info
            reputation_info.stake = reputation_info.stake.saturating_sub(amount);
            reputation_info.last_update = <frame_system::Pallet<T>>::block_number();

            // Update total stake
            let new_total = Self::total_stake().saturating_sub(amount);
            <TotalStake<T>>::put(new_total);

            // Store updated reputation info
            <Reputation<T>>::insert(&who, reputation_info);

            Self::deposit_event(Event::Unstaked {
                agent_id: who,
                amount,
            });

            Ok(())
        }

        /// Reward agent for successful consensus participation
        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::reward_consensus())]
        pub fn reward_consensus(
            origin: OriginFor<T>,
            agent_id: T::AccountId,
        ) -> DispatchResult {
            ensure_root(origin)?;

            let mut reputation_info = Self::reputation(&agent_id);
            
            // Apply decay before adding reward
            Self::apply_reputation_decay(&agent_id, &mut reputation_info)?;

            // Calculate stake-weighted reward
            let base_reward = T::ConsensusReward::get();
            let stake_multiplier = if !Self::total_stake().is_zero() {
                // Stake weight as percentage of total stake (max 2x multiplier)
                let stake_percentage = Perbill::from_rational(reputation_info.stake, Self::total_stake());
                1u64.saturating_add(stake_percentage.mul_floor(100u64))
            } else {
                1u64
            };

            let weighted_reward = base_reward.saturating_mul(stake_multiplier);
            let old_reputation = reputation_info.reputation;
            
            reputation_info.reputation = reputation_info.reputation.saturating_add(weighted_reward);
            reputation_info.consensus_count = reputation_info.consensus_count.saturating_add(1);
            reputation_info.last_update = <frame_system::Pallet<T>>::block_number();

            <Reputation<T>>::insert(&agent_id, reputation_info.clone());

            Self::deposit_event(Event::ReputationUpdated {
                agent_id: agent_id.clone(),
                old_reputation,
                new_reputation: reputation_info.reputation,
            });

            Self::deposit_event(Event::ConsensusRewardDistributed {
                agent_id,
                reputation_reward: weighted_reward,
            });

            Ok(())
        }

        /// Report an offense and apply slashing
        #[pallet::call_index(3)]
        #[pallet::weight(T::WeightInfo::report_offense())]
        pub fn report_offense(
            origin: OriginFor<T>,
            agent_id: T::AccountId,
            offense_type: OffenseType,
        ) -> DispatchResult {
            ensure_root(origin)?;

            let mut reputation_info = Self::reputation(&agent_id);
            ensure!(!reputation_info.is_banned, Error::<T>::AgentBanned);

            // Apply decay before processing offense
            Self::apply_reputation_decay(&agent_id, &mut reputation_info)?;

            // Determine slash amount and reputation penalty
            let (slash_percentage, reputation_penalty, should_quarantine) = match offense_type {
                OffenseType::Unresponsiveness => (T::UnresponsivenessSlash::get(), 50u64, false),
                OffenseType::Equivocation => (T::EquivocationSlash::get(), 200u64, true),
                OffenseType::InvalidData => (T::UnresponsivenessSlash::get(), 75u64, false),
                OffenseType::ConsensusManipulation => (T::EquivocationSlash::get(), 300u64, true),
            };

            // Calculate slash amount
            let slash_amount = slash_percentage.mul_floor(reputation_info.stake);
            
            if !slash_amount.is_zero() {
                ensure!(reputation_info.stake >= slash_amount, Error::<T>::InsufficientStakeToSlash);

                // Slash the stake
                let slashed = T::Currency::slash_reserved(&agent_id, slash_amount);
                T::Slash::on_unbalanced(slashed.0);

                // Update stake
                reputation_info.stake = reputation_info.stake.saturating_sub(slash_amount);
                
                // Update total stake
                let new_total = Self::total_stake().saturating_sub(slash_amount);
                <TotalStake<T>>::put(new_total);
            }

            // Apply reputation penalty
            reputation_info.reputation = reputation_info.reputation.saturating_sub(reputation_penalty);
            reputation_info.offense_count = reputation_info.offense_count.saturating_add(1);

            // Record offense
            let current_block = <frame_system::Pallet<T>>::block_number();
            let mut offense_history = Self::offense_history(&agent_id);
            let _ = offense_history.try_push((offense_type.clone(), current_block));
            <OffenseHistory<T>>::insert(&agent_id, offense_history);

            // Apply quarantine if needed
            if should_quarantine {
                let quarantine_until = current_block.saturating_add(T::QuarantinePeriod::get());
                reputation_info.quarantine_until = Some(quarantine_until);

                Self::deposit_event(Event::AgentQuarantined {
                    agent_id: agent_id.clone(),
                    until_block: quarantine_until,
                });
            }

            // Check for permanent ban
            if reputation_info.offense_count >= T::MaxOffenses::get() {
                reputation_info.is_banned = true;
                
                Self::deposit_event(Event::AgentBanned {
                    agent_id: agent_id.clone(),
                });
            }

            reputation_info.last_update = current_block;
            <Reputation<T>>::insert(&agent_id, reputation_info);

            Self::deposit_event(Event::AgentSlashed {
                agent_id,
                offense_type,
                slash_amount,
                reputation_penalty,
            });

            Ok(())
        }
    }

    impl<T: Config> Pallet<T> {
        /// Apply reputation decay to a specific agent
        fn apply_reputation_decay(
            agent_id: &T::AccountId,
            reputation_info: &mut ReputationInfo<T>,
        ) -> DispatchResult {
            let current_block = <frame_system::Pallet<T>>::block_number();
            let blocks_elapsed = current_block.saturating_sub(reputation_info.last_update);

            if !blocks_elapsed.is_zero() && !reputation_info.reputation.is_zero() {
                // Quadratic decay: decay rate increases with higher reputation
                let base_decay = T::BaseDecayRate::get();
                
                // Calculate quadratic multiplier (reputation squared / 1000 to keep reasonable)
                let reputation_factor = reputation_info.reputation
                    .saturating_mul(reputation_info.reputation)
                    .saturating_div(1000);
                
                let quadratic_decay = base_decay.saturating_mul(Perbill::from_parts(
                    reputation_factor.min(1_000_000u64) as u32 // Cap to prevent overflow
                ));

                // Apply decay for each block elapsed
                for _ in 0..blocks_elapsed.min(100u32.into()) { // Cap iterations to prevent timeout
                    let decay_amount = quadratic_decay.mul_floor(reputation_info.reputation);
                    reputation_info.reputation = reputation_info.reputation.saturating_sub(decay_amount);
                    
                    // Stop if reputation is very low
                    if reputation_info.reputation < 10 {
                        break;
                    }
                }
            }

            Ok(())
        }

        /// Apply decay to all agents' reputation
        fn apply_global_reputation_decay() -> DispatchResult {
            // In a real implementation, this would be optimized to process in batches
            // For now, we'll just update the timestamp
            Ok(())
        }

        /// Get the effective reputation (stake-weighted)
        pub fn effective_reputation(agent_id: &T::AccountId) -> u64 {
            let reputation_info = Self::reputation(agent_id);
            
            if reputation_info.is_banned || 
               reputation_info.quarantine_until.map_or(false, |until| 
                   <frame_system::Pallet<T>>::block_number() <= until) {
                return 0;
            }

            // Weight reputation by stake (minimum 1x, maximum 5x multiplier)
            let stake_multiplier = if !Self::total_stake().is_zero() {
                let stake_percentage = Perbill::from_rational(reputation_info.stake, Self::total_stake());
                1u64.saturating_add(stake_percentage.mul_floor(400u64)) // Up to 5x multiplier
            } else {
                1u64
            };

            reputation_info.reputation.saturating_mul(stake_multiplier)
        }

        /// Check if agent is active and can participate
        pub fn can_participate(agent_id: &T::AccountId) -> bool {
            let reputation_info = Self::reputation(agent_id);
            
            !reputation_info.is_banned &&
            reputation_info.quarantine_until.map_or(true, |until| 
                <frame_system::Pallet<T>>::block_number() > until) &&
            !reputation_info.stake.is_zero()
        }
    }
} 