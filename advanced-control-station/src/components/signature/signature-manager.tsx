// ----------------------------------------------------------------------------
//  File:        signature-manager.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Digital signature and authentication management interface
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: June 2025
// ----------------------------------------------------------------------------

'use client'

import React, { useState, useEffect } from 'react'

interface DigitalSignature {
  id: string
  documentName: string
  documentHash: string
  signatureHash: string
  signerName: string
  signerRole: string
  timestamp: Date
  status: 'pending' | 'signed' | 'verified' | 'expired' | 'invalid'
  algorithm: 'RSA-SHA256' | 'ECDSA-SHA256' | 'EdDSA' | 'HMAC-SHA256'
  publicKey?: string
  expiryDate?: Date
  metadata?: {
    location?: string
    reason?: string
    contact?: string
    deviceInfo?: string
  }
}

interface CryptoKey {
  id: string
  name: string
  type: 'RSA' | 'ECDSA' | 'EdDSA'
  keySize: number
  purpose: 'signing' | 'encryption' | 'both'
  status: 'active' | 'revoked' | 'expired'
  createdAt: Date
  expiresAt?: Date
  fingerprint: string
  publicKey: string
  usage: number
}

interface SignatureRequest {
  id: string
  documentName: string
  requestedBy: string
  requestedFor: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline?: Date
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: Date
  description?: string
}

const mockSignatures: DigitalSignature[] = [
  {
    id: 'sig-001',
    documentName: 'Q4 Strategic Plan.pdf',
    documentHash: 'sha256:a1b2c3d4e5f6...',
    signatureHash: 'sig256:f6e5d4c3b2a1...',
    signerName: 'Marcus Thompson',
    signerRole: 'CEO',
    timestamp: new Date(Date.now() - 86400000),
    status: 'verified',
    algorithm: 'RSA-SHA256',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEF...',
    metadata: {
      location: 'New York, NY',
      reason: 'Strategic approval',
      contact: 'marcus@company.com'
    }
  },
  {
    id: 'sig-002',
    documentName: 'Agent Configuration Update.json',
    documentHash: 'sha256:b2c3d4e5f6a1...',
    signatureHash: 'sig256:e5f6a1b2c3d4...',
    signerName: 'Victoria Chen',
    signerRole: 'CTO',
    timestamp: new Date(Date.now() - 43200000),
    status: 'signed',
    algorithm: 'ECDSA-SHA256',
    publicKey: 'MFkwEwYHKoZIzj0CAQYIKo...',
    metadata: {
      location: 'San Francisco, CA',
      reason: 'Technical approval',
      contact: 'victoria@company.com'
    }
  },
  {
    id: 'sig-003',
    documentName: 'Financial Report Q3.xlsx',
    documentHash: 'sha256:c3d4e5f6a1b2...',
    signatureHash: 'sig256:d4e5f6a1b2c3...',
    signerName: 'Alexander Rodriguez',
    signerRole: 'CFO',
    timestamp: new Date(Date.now() - 21600000),
    status: 'pending',
    algorithm: 'RSA-SHA256',
    metadata: {
      location: 'Chicago, IL',
      reason: 'Financial certification',
      contact: 'alexander@company.com'
    }
  }
]

const mockKeys: CryptoKey[] = [
  {
    id: 'key-001',
    name: 'CEO Primary Signing Key',
    type: 'RSA',
    keySize: 2048,
    purpose: 'signing',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 30),
    expiresAt: new Date(Date.now() + 86400000 * 365),
    fingerprint: 'A1:B2:C3:D4:E5:F6:A7:B8',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEF...',
    usage: 47
  },
  {
    id: 'key-002',
    name: 'CTO Development Key',
    type: 'ECDSA',
    keySize: 256,
    purpose: 'both',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 15),
    expiresAt: new Date(Date.now() + 86400000 * 180),
    fingerprint: 'B2:C3:D4:E5:F6:A7:B8:C9',
    publicKey: 'MFkwEwYHKoZIzj0CAQYIKo...',
    usage: 23
  },
  {
    id: 'key-003',
    name: 'CFO Financial Key',
    type: 'RSA',
    keySize: 4096,
    purpose: 'signing',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 7),
    fingerprint: 'C3:D4:E5:F6:A7:B8:C9:D0',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEF...',
    usage: 12
  }
]

const mockRequests: SignatureRequest[] = [
  {
    id: 'req-001',
    documentName: 'Contract Amendment #42',
    requestedBy: 'Legal Department',
    requestedFor: 'Marcus Thompson (CEO)',
    priority: 'high',
    deadline: new Date(Date.now() + 86400000 * 2),
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000),
    description: 'Contract amendment requires CEO signature for regulatory compliance'
  },
  {
    id: 'req-002',
    documentName: 'System Security Audit Report',
    requestedBy: 'Security Team',
    requestedFor: 'Victoria Chen (CTO)',
    priority: 'medium',
    deadline: new Date(Date.now() + 86400000 * 5),
    status: 'approved',
    createdAt: new Date(Date.now() - 7200000),
    description: 'Annual security audit report requires technical approval'
  }
]

export function SignatureManager() {
  const [activeTab, setActiveTab] = useState<'signatures' | 'keys' | 'requests'>('signatures')
  const [signatures, setSignatures] = useState<DigitalSignature[]>(mockSignatures)
  const [keys, setKeys] = useState<CryptoKey[]>(mockKeys)
  const [requests, setRequests] = useState<SignatureRequest[]>(mockRequests)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    // Simulate real-time signature verification
    const interval = setInterval(() => {
      setSignatures(prev => prev.map(sig => {
        if (sig.status === 'pending' && Math.random() > 0.8) {
          return { ...sig, status: 'signed' as const }
        }
        if (sig.status === 'signed' && Math.random() > 0.9) {
          return { ...sig, status: 'verified' as const }
        }
        return sig
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'signed': 'bg-blue-100 text-blue-800',
      'verified': 'bg-green-100 text-green-800',
      'expired': 'bg-gray-100 text-gray-800',
      'invalid': 'bg-red-100 text-red-800',
      'active': 'bg-green-100 text-green-800',
      'revoked': 'bg-red-100 text-red-800',
      'approved': 'bg-blue-100 text-blue-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-green-100 text-green-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const verifySignature = async (signatureId: string) => {
    setSignatures(prev => prev.map(sig => 
      sig.id === signatureId 
        ? { ...sig, status: 'verified' as const }
        : sig
    ))
  }

  const revokeKey = async (keyId: string) => {
    setKeys(prev => prev.map(key => 
      key.id === keyId 
        ? { ...key, status: 'revoked' as const }
        : key
    ))
  }

  const approveRequest = async (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'approved' as const }
        : req
    ))
  }

  const generateNewKey = () => {
    const newKey: CryptoKey = {
      id: `key-${Date.now()}`,
      name: `Generated Key ${Date.now()}`,
      type: 'RSA',
      keySize: 2048,
      purpose: 'signing',
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000 * 365),
      fingerprint: Array.from({length: 8}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':'),
      publicKey: 'MIIBIjANBgkqhkiG9w0BAQEF...',
      usage: 0
    }
    setKeys(prev => [newKey, ...prev])
    setShowCreateModal(false)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Signature Manager</h1>
            <p className="text-gray-600">Manage digital signatures, keys, and authentication</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Generate Key
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8">
          {[
            { id: 'signatures', label: 'Digital Signatures', count: signatures.length },
            { id: 'keys', label: 'Cryptographic Keys', count: keys.length },
            { id: 'requests', label: 'Signature Requests', count: requests.filter(r => r.status === 'pending').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'signatures' && (
            <div className="space-y-4">
              {signatures.map(signature => (
                <div
                  key={signature.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedItem?.id === signature.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedItem(signature)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{signature.documentName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(signature.status)}`}>
                          {signature.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Signer:</span> {signature.signerName} ({signature.signerRole})
                        </div>
                        <div>
                          <span className="font-medium">Algorithm:</span> {signature.algorithm}
                        </div>
                        <div>
                          <span className="font-medium">Signed:</span> {formatDate(signature.timestamp)}
                        </div>
                        <div>
                          <span className="font-medium">Document Hash:</span> {signature.documentHash.substring(0, 20)}...
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {signature.status === 'signed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            verifySignature(signature.id)
                          }}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-4">
              {keys.map(key => (
                <div
                  key={key.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedItem?.id === key.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedItem(key)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(key.status)}`}>
                          {key.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Type:</span> {key.type} ({key.keySize} bits)
                        </div>
                        <div>
                          <span className="font-medium">Purpose:</span> {key.purpose}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(key.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Usage:</span> {key.usage} times
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Fingerprint:</span> {key.fingerprint}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {key.status === 'active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            revokeKey(key.id)
                          }}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.map(request => (
                <div
                  key={request.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedItem?.id === request.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedItem(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.documentName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Requested by:</span> {request.requestedBy}
                        </div>
                        <div>
                          <span className="font-medium">For:</span> {request.requestedFor}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(request.createdAt)}
                        </div>
                        {request.deadline && (
                          <div>
                            <span className="font-medium">Deadline:</span> {formatDate(request.deadline)}
                          </div>
                        )}
                      </div>
                      {request.description && (
                        <p className="mt-2 text-sm text-gray-600">{request.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              approveRequest(request.id)
                            }}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            Approve
                          </button>
                          <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Panel */}
        {selectedItem && (
          <div className="w-96 border-l border-gray-200 bg-gray-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(selectedItem).map(([key, value]) => {
                  if (key === 'id' || value === null || value === undefined) return null
                  
                  let displayValue = value
                  if (value instanceof Date) {
                    displayValue = formatDate(value)
                  } else if (typeof value === 'object') {
                    displayValue = JSON.stringify(value, null, 2)
                  }
                  
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="text-sm text-gray-900 bg-white p-2 rounded border">
                        {typeof value === 'object' && !(value instanceof Date) ? (
                          <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                        ) : (
                          String(displayValue)
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Generate New Cryptographic Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  placeholder="Enter key name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="RSA">RSA</option>
                  <option value="ECDSA">ECDSA</option>
                  <option value="EdDSA">EdDSA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Size</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="2048">2048 bits</option>
                  <option value="4096">4096 bits</option>
                  <option value="256">256 bits (ECDSA)</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={generateNewKey}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 