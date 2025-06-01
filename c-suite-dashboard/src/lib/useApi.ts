// ----------------------------------------------------------------------------
//  File:        useApi.ts
//  Project:     Celaya Solutions (C-Suite Dashboard)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: React hook for connecting to the C-Suite blockchain via Polkadot API
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: May 2025
// ----------------------------------------------------------------------------

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

interface UseApiReturn {
  api: ApiPromise | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Updated to connect to zombienet parachain by default
const DEFAULT_ENDPOINT = 'ws://localhost:61279'; // C-Suite parachain (zombienet)
// const RELAY_ENDPOINT = 'ws://localhost:61279';   // Relay chain Alice (zombienet) 
// const STANDALONE_ENDPOINT = 'ws://localhost:61279'; // Standalone mode

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds (reduced from 5)

export const useApi = (endpoint: string = DEFAULT_ENDPOINT): UseApiReturn => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Use refs to avoid dependency issues
  const endpointRef = useRef(endpoint);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // Update endpoint ref when prop changes
  useEffect(() => {
    endpointRef.current = endpoint;
  }, [endpoint]);

  // Prevent hydration issues by only running on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || (api && isConnected) || retryCount >= MAX_RETRY_ATTEMPTS) {
      return;
    }

    isConnectingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Attempting to connect to ${endpointRef.current}...`);
      
      const provider = new WsProvider(endpointRef.current);
      const apiInstance = await ApiPromise.create({ 
        provider,
        throwOnConnect: false // Don't throw on connection issues
      });

      // Wait for the API to be ready with timeout
      const readyPromise = apiInstance.isReady;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );
      
      await Promise.race([readyPromise, timeoutPromise]);

      setApi(apiInstance);
      setIsConnected(true);
      setRetryCount(0); // Reset retry count on successful connection
      
      console.log('✅ Connected to C-Suite blockchain:', {
        endpoint: endpointRef.current,
        chainName: apiInstance.runtimeChain?.toString() || 'Unknown',
        nodeName: apiInstance.runtimeVersion?.specName?.toString() || 'Unknown',
        nodeVersion: apiInstance.runtimeVersion?.specVersion?.toString() || 'Unknown',
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to blockchain';
      console.warn(`❌ Connection failed (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS}):`, errorMessage);
      
      setError(errorMessage);
      setRetryCount(prev => {
        const newCount = prev + 1;
        
        // Schedule retry with exponential backoff if under max attempts
        if (newCount < MAX_RETRY_ATTEMPTS) {
          const delay = RETRY_DELAY * Math.pow(2, prev);
          console.log(`⏳ Retrying in ${delay}ms...`);
          
          retryTimeoutRef.current = setTimeout(() => {
            if (isClient && !isConnected && !api) {
              connect();
            }
          }, delay);
        } else {
          console.warn('🔌 Max retry attempts reached. Using mock data for development.');
          console.warn('💡 Start zombienet with: cd .. && ./c-suite-blockchain.sh zombienet');
        }
        
        return newCount;
      });
    } finally {
      setIsLoading(false);
      isConnectingRef.current = false;
    }
  }, []); // Remove all dependencies to prevent infinite loops

  const disconnect = useCallback(() => {
    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (api) {
      api.disconnect();
      setApi(null);
      setIsConnected(false);
      setError(null);
      setRetryCount(0);
      console.log('🔌 Disconnected from blockchain');
    }
  }, [api]);

  // Auto-connect on client mount only
  useEffect(() => {
    if (isClient && !api && !isConnectingRef.current && retryCount === 0) {
      console.log('🚀 Auto-connecting to blockchain...');
      console.log('Environment check:', {
        isClient,
        api: !!api,
        isConnecting: isConnectingRef.current,
        retryCount,
        endpoint: endpointRef.current
      });
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (api) {
        api.disconnect();
      }
    };
  }, [isClient]); // Only depend on isClient

  return {
    api,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
  };
};

// Helper function for direct API creation without hook
export const createApi = async (endpoint: string = DEFAULT_ENDPOINT): Promise<ApiPromise> => {
  const provider = new WsProvider(endpoint);
  const api = await ApiPromise.create({ provider });
  await api.isReady;
  return api;
};

// Types for common blockchain queries
export interface AgentInfo {
  id: string;
  owner: string;
  trustScore: number;
  metadata: Record<string, unknown>;
  isActive: boolean;
}

export interface ConsensusLog {
  id: string;
  agentId: string;
  timestamp: number;
  data: string;
  signatures: string[];
}

export interface InsightRecord {
  cid: string;
  agentId: string;
  timestamp: number;
  verified: boolean;
} 