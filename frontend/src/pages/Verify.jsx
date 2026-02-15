import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'
import { Search, CheckCircle, XCircle, ExternalLink, Loader2, Upload, Hash, FileText, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    PROOF_OF_EXISTENCE_ADDRESS,
    PROOF_OF_EXISTENCE_ABI,
    ARBITRUM_SEPOLIA_RPC,
    ARBISCAN_URL,
} from '../lib/contracts'
import { formatTimestamp, truncateHex, hashDocument, truncateToField, formatFileSize } from '../lib/utils'
import { computeCommitment, commitmentToBytes32 } from '../lib/noir'

export default function Verify() {
    const [mode, setMode] = useState('document') // 'document' | 'commitment'
    const [commitmentInput, setCommitmentInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [searched, setSearched] = useState(false)

    // Document + Salt mode state
    const [file, setFile] = useState(null)
    const [documentHash, setDocumentHash] = useState(null)
    const [fieldHash, setFieldHash] = useState(null)
    const [salt, setSalt] = useState('')
    const [hashing, setHashing] = useState(false)
    const [computedCommitment, setComputedCommitment] = useState(null)

    // File upload handler
    const handleFileUpload = useCallback(async (e) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return
        if (selectedFile.size > 50 * 1024 * 1024) {
            toast.error('File too large. Maximum 50MB.')
            return
        }
        setFile(selectedFile)
        setHashing(true)
        try {
            const hash = await hashDocument(selectedFile)
            const field = truncateToField(hash)
            setDocumentHash(hash)
            setFieldHash(field)
            toast.success('Document hashed')
        } catch (err) {
            toast.error('Failed to hash document')
        } finally {
            setHashing(false)
        }
    }, [])

    // Verify by commitment hash (direct lookup)
    async function handleVerifyByCommitment(e) {
        e.preventDefault()

        let normalizedInput = commitmentInput.trim()
        if (!normalizedInput.startsWith('0x')) {
            normalizedInput = '0x' + normalizedInput
        }

        if (normalizedInput.length !== 66) {
            toast.error('Invalid commitment hash. Must be 32 bytes (66 hex chars with 0x)')
            return
        }

        setLoading(true)
        setSearched(false)

        try {
            const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC)
            const contract = new ethers.Contract(
                PROOF_OF_EXISTENCE_ADDRESS,
                PROOF_OF_EXISTENCE_ABI,
                provider
            )

            const [exists, submitter, timestamp, blockNumber] = await contract.verifyExistence(normalizedInput)

            setResult({
                exists,
                submitter,
                timestamp: Number(timestamp),
                blockNumber: Number(blockNumber),
                commitment: normalizedInput,
            })
            setSearched(true)
        } catch (error) {
            console.error('Verification error:', error)
            toast.error('Error querying blockchain')
        } finally {
            setLoading(false)
        }
    }

    // Verify by document + salt (recompute commitment, then lookup)
    async function handleVerifyByDocument(e) {
        e.preventDefault()

        if (!file || !fieldHash) {
            toast.error('Please upload a document first')
            return
        }
        if (!salt.trim()) {
            toast.error('Please enter your salt')
            return
        }

        setLoading(true)
        setSearched(false)

        try {
            // Step 1: Recompute Pedersen commitment from document hash + salt
            toast.loading('Computing Pedersen commitment via WASM...', { id: 'verify' })
            const commitment = await computeCommitment(fieldHash, salt.trim())
            setComputedCommitment(commitment)

            // Step 2: Convert to bytes32 and query on-chain
            const bytes32 = commitmentToBytes32(commitment)
            toast.loading('Querying blockchain...', { id: 'verify' })

            const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC)
            const contract = new ethers.Contract(
                PROOF_OF_EXISTENCE_ADDRESS,
                PROOF_OF_EXISTENCE_ABI,
                provider
            )

            const [exists, submitter, timestamp, blockNumber] = await contract.verifyExistence(bytes32)

            setResult({
                exists,
                submitter,
                timestamp: Number(timestamp),
                blockNumber: Number(blockNumber),
                commitment: bytes32,
            })
            setSearched(true)

            if (exists) {
                toast.success('Document verified on-chain!', { id: 'verify' })
            } else {
                toast.error('Document not found on-chain', { id: 'verify' })
            }
        } catch (error) {
            console.error('Verification error:', error)
            toast.error('Verification failed: ' + (error.message || 'Unknown error'), { id: 'verify' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto mt-24 mb-20">
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 70 }}
            >
                <h1 className="text-3xl font-semibold mb-2">Verify Proof</h1>
                <p className="text-slate-400 mb-8">
                    Verify that a document was timestamped on-chain. No wallet or gas required.
                </p>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setMode('document'); setSearched(false); setResult(null) }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${mode === 'document'
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                    >
                        <FileText className="size-4" /> Verify by Document
                    </button>
                    <button
                        onClick={() => { setMode('commitment'); setSearched(false); setResult(null) }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${mode === 'commitment'
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                    >
                        <Hash className="size-4" /> Verify by Commitment
                    </button>
                </div>

                {/* Document + Salt Mode */}
                {mode === 'document' && (
                    <form onSubmit={handleVerifyByDocument} className="mb-8 space-y-5">
                        {/* File Upload */}
                        <label
                            htmlFor="verify-file"
                            className={`block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file ? 'border-indigo-600 bg-indigo-600/5' : 'border-slate-700 hover:border-slate-500'}`}
                        >
                            <input
                                id="verify-file"
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                            />
                            {hashing ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="size-8 text-indigo-500 animate-spin" />
                                    <p className="text-slate-400 text-sm">Hashing document...</p>
                                </div>
                            ) : file ? (
                                <div className="flex flex-col items-center gap-3">
                                    <FileText className="size-8 text-indigo-400" />
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <Upload className="size-8 text-slate-500" />
                                    <div>
                                        <p className="font-medium">Upload Document</p>
                                        <p className="text-sm text-slate-400 mt-1">The file you want to verify (hashed locally — never uploaded)</p>
                                    </div>
                                </div>
                            )}
                        </label>

                        {/* Hash Display */}
                        {documentHash && (
                            <div className="bg-slate-900/50 rounded-lg p-4">
                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                    <Hash className="size-3" /> Document Hash (SHA-256)
                                </p>
                                <p className="text-sm font-mono text-indigo-400 break-all">{documentHash}</p>
                            </div>
                        )}

                        {/* Salt Input */}
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                <Key className="size-4 text-amber-400" /> Salt
                            </label>
                            <input
                                type="text"
                                value={salt}
                                onChange={e => setSalt(e.target.value)}
                                placeholder="0x... (the salt from your original proof)"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono focus:border-indigo-500 focus:outline-none transition"
                            />
                            <p className="text-xs text-slate-500 mt-1.5">
                                The salt was shown when you created your proof. Without it, the commitment cannot be recomputed.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !file || !salt.trim()}
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                            Verify Document
                        </button>
                    </form>
                )}

                {/* Commitment Hash Mode */}
                {mode === 'commitment' && (
                    <form onSubmit={handleVerifyByCommitment} className="mb-8">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={commitmentInput}
                                    onChange={(e) => setCommitmentInput(e.target.value)}
                                    placeholder="0x commitment hash..."
                                    className="w-full h-12 pl-12 pr-4 bg-transparent border border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-indigo-600 transition font-mono text-sm placeholder:font-sans"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !commitmentInput.trim()}
                                className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                                Verify
                            </button>
                        </div>
                    </form>
                )}

                {/* Computed Commitment (document mode) */}
                {mode === 'document' && computedCommitment && searched && (
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="border border-slate-800 rounded-xl p-5 mb-4"
                    >
                        <p className="text-xs text-slate-400 mb-1">Recomputed Pedersen Commitment</p>
                        <p className="text-sm font-mono text-purple-400 break-all">{computedCommitment}</p>
                        <p className="text-xs text-slate-500 mt-2">
                            This commitment was recomputed from your document + salt using the same Pedersen hash as the Noir circuit.
                        </p>
                    </motion.div>
                )}

                {/* Results */}
                {searched && result && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`border rounded-xl overflow-hidden ${result.exists ? 'border-green-700/50' : 'border-red-700/50'
                            }`}
                    >
                        {/* Status Header */}
                        <div
                            className={`px-6 py-4 flex items-center gap-3 ${result.exists ? 'bg-green-900/20' : 'bg-red-900/20'
                                }`}
                        >
                            {result.exists ? (
                                <>
                                    <CheckCircle className="size-6 text-green-400" />
                                    <div>
                                        <p className="text-green-400 font-semibold text-lg">Verified ✓</p>
                                        <p className="text-green-400/70 text-sm">
                                            This commitment exists on the blockchain
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="size-6 text-red-400" />
                                    <div>
                                        <p className="text-red-400 font-semibold text-lg">Not Found</p>
                                        <p className="text-red-400/70 text-sm">
                                            This commitment does not exist on-chain
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Details */}
                        {result.exists && (
                            <div className="p-6 space-y-4">
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Commitment</p>
                                    <p className="text-sm font-mono text-indigo-400 break-all">
                                        {result.commitment}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 rounded-lg p-4">
                                        <p className="text-xs text-slate-400 mb-1">Timestamp</p>
                                        <p className="text-sm">{formatTimestamp(result.timestamp)}</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-4">
                                        <p className="text-xs text-slate-400 mb-1">Block Number</p>
                                        <a
                                            href={`${ARBISCAN_URL}/block/${result.blockNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {result.blockNumber}
                                            <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Submitter</p>
                                    <a
                                        href={`${ARBISCAN_URL}/address/${result.submitter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-mono text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        {result.submitter}
                                        <ExternalLink className="size-3" />
                                    </a>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Time Since Submission</p>
                                    <p className="text-sm">
                                        {Math.floor((Date.now() / 1000 - result.timestamp) / 86400)} days ago
                                    </p>
                                </div>
                                <Link
                                    to={`/disclosures?commitment=${encodeURIComponent(result.commitment)}`}
                                    className="flex items-center justify-center gap-2 bg-purple-600/20 border border-purple-600/30 hover:bg-purple-600/30 transition text-purple-400 rounded-lg p-4 text-sm font-medium"
                                >
                                    <ExternalLink className="size-4" />
                                    View Selective Disclosures
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Info */}
                <div className="mt-8 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">How Verification Works</h3>
                    <ul className="text-sm text-slate-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <strong>By Document:</strong> Upload your file + enter the salt → the Pedersen commitment is recomputed locally via WASM → then checked on-chain
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <strong>By Commitment:</strong> Paste the commitment hash directly if you already have it
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            Verification is a free read-only query — no wallet or gas needed
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            Your document never leaves your browser — only the SHA-256 hash is computed locally
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            The salt acts as a secret key — without it, no one can link a document to its commitment
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            Records are permanent and tamper-proof on the Arbitrum blockchain
                        </li>
                    </ul>
                </div>
            </motion.div>
        </div>
    )
}
