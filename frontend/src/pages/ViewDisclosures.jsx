import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import {
    Search, Eye, EyeOff, Mail, HardDrive, FileText, Clock,
    ExternalLink, Loader2, Shield, Hash, ChevronDown, ChevronUp, AlertCircle,
    CheckCircle, XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
    PROOF_OF_EXISTENCE_ADDRESS,
    PROOF_OF_EXISTENCE_ABI,
    ARBITRUM_SEPOLIA_RPC,
    ARBISCAN_URL,
} from '../lib/contracts'
import { truncateHex, formatTimestamp, formatFileSize } from '../lib/utils'
import { computeDomainHashFromDomain } from '../lib/noir'

/** Common email domains to auto-check */
const COMMON_DOMAINS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com',
    'icloud.com', 'aol.com', 'zoho.com', 'mail.com', 'yandex.com',
    'live.com', 'msn.com', 'proton.me', 'tutanota.com', 'fastmail.com',
    'pm.me', 'hey.com', 'duck.com', 'gmx.com', 'gmx.net',
    'mit.edu', 'stanford.edu', 'harvard.edu', 'berkeley.edu',
]

/**
 * Decode the claimedFileType bytes32[20] array to a readable string.
 * Each element is a single ASCII char stored as a bytes32 (uint256).
 */
function decodeFileType(claimedFileType) {
    if (!claimedFileType || claimedFileType.length === 0) return ''
    const chars = claimedFileType
        .map(b => {
            const n = typeof b === 'bigint' ? b : BigInt(b)
            return n === 0n ? '' : String.fromCharCode(Number(n))
        })
        .join('')
        .replace(/\0/g, '')
    return chars || '—'
}

/**
 * Format size range to human-readable string
 */
function formatSizeRange(min, max) {
    const minNum = typeof min === 'bigint' ? Number(min) : Number(min)
    const maxNum = typeof max === 'bigint' ? Number(max) : Number(max)
    if (minNum === 0 && maxNum === 0) return '—'
    return `${formatFileSize(minNum)} – ${formatFileSize(maxNum)}`
}

export default function ViewDisclosures() {
    const [searchParams] = useSearchParams()
    const [commitmentInput, setCommitmentInput] = useState(searchParams.get('commitment') || '')
    const [loading, setLoading] = useState(false)
    const [disclosures, setDisclosures] = useState([])
    const [commitmentInfo, setCommitmentInfo] = useState(null)
    const [searched, setSearched] = useState(false)
    const [expandedIndex, setExpandedIndex] = useState(null)

    // Auto-load if commitment param present
    useEffect(() => {
        const c = searchParams.get('commitment')
        if (c) {
            setCommitmentInput(c)
            loadDisclosures(c)
        }
    }, [searchParams.get('commitment')])

    async function loadDisclosures(commitmentOverride) {
        let commitment = (commitmentOverride || commitmentInput).trim()
        if (!commitment.startsWith('0x')) commitment = '0x' + commitment
        if (commitment.length !== 66) {
            toast.error('Invalid commitment hash (must be 32 bytes)')
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

            // Check commitment exists
            const [exists, submitter, timestamp, blockNumber] = await contract.verifyExistence(commitment)
            setCommitmentInfo({ exists, submitter, timestamp: Number(timestamp), blockNumber: Number(blockNumber) })

            if (!exists) {
                setDisclosures([])
                setSearched(true)
                setLoading(false)
                return
            }

            // Get disclosure count
            const count = await contract.getDisclosureCount(commitment)
            const countNum = Number(count)

            if (countNum === 0) {
                setDisclosures([])
                setSearched(true)
                setLoading(false)
                return
            }

            // Fetch all disclosures
            const results = []
            for (let i = 0; i < countNum; i++) {
                const d = await contract.getDisclosure(commitment, i)
                results.push({
                    index: i,
                    commitment: d.commitment,
                    revealEmailDomain: d.revealEmailDomain,
                    revealSizeRange: d.revealSizeRange,
                    revealFileType: d.revealFileType,
                    claimedDomainHash: d.claimedDomainHash,
                    claimedSizeMin: d.claimedSizeMin,
                    claimedSizeMax: d.claimedSizeMax,
                    claimedFileType: d.claimedFileType,
                    timestamp: Number(d.timestamp),
                    exists: d.exists,
                })
            }

            setDisclosures(results)
            setSearched(true)
        } catch (error) {
            console.error('Error loading disclosures:', error)
            toast.error('Failed to load disclosures')
        } finally {
            setLoading(false)
        }
    }

    function handleSearch(e) {
        e.preventDefault()
        loadDisclosures()
    }

    return (
        <div className="max-w-4xl mx-auto mt-24 mb-20">
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 70 }}
            >
                <h1 className="text-3xl font-semibold mb-2">Disclosure Viewer</h1>
                <p className="text-slate-400 mb-8">
                    View selectively disclosed properties for any commitment. No wallet required.
                </p>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                            <input
                                type="text"
                                value={commitmentInput}
                                onChange={e => setCommitmentInput(e.target.value)}
                                placeholder="0x commitment hash..."
                                className="w-full h-12 pl-12 pr-4 bg-transparent border border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-indigo-600 transition font-mono text-sm placeholder:font-sans"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !commitmentInput.trim()}
                            className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
                            View
                        </button>
                    </div>
                </form>

                {/* Results */}
                {searched && commitmentInfo && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        {/* Commitment Info */}
                        {!commitmentInfo.exists ? (
                            <div className="border border-red-700/50 bg-red-900/10 rounded-xl p-6 flex items-center gap-3">
                                <AlertCircle className="size-6 text-red-400 shrink-0" />
                                <div>
                                    <p className="text-red-400 font-semibold">Commitment Not Found</p>
                                    <p className="text-red-400/70 text-sm mt-1">This commitment does not exist on-chain.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Summary Card */}
                                <div className="border border-slate-800 rounded-xl p-5 mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Shield className="size-5 text-indigo-400" />
                                            <h2 className="text-lg font-medium">Commitment Info</h2>
                                        </div>
                                        <span className="text-sm text-slate-400">
                                            {disclosures.length} disclosure{disclosures.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-4 mb-3">
                                        <p className="text-xs text-slate-400 mb-1">Commitment</p>
                                        <p className="text-sm font-mono text-indigo-400 break-all">
                                            {commitmentInput.startsWith('0x') ? commitmentInput : '0x' + commitmentInput}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400">Submitter</p>
                                            <a
                                                href={`${ARBISCAN_URL}/address/${commitmentInfo.submitter}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-mono text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                                            >
                                                {truncateHex(commitmentInfo.submitter, 6)}
                                                <ExternalLink className="size-3" />
                                            </a>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400">Proof Timestamp</p>
                                            <p className="text-sm mt-0.5">{formatTimestamp(commitmentInfo.timestamp)}</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400">Block</p>
                                            <a
                                                href={`${ARBISCAN_URL}/block/${commitmentInfo.blockNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                                            >
                                                {commitmentInfo.blockNumber}
                                                <ExternalLink className="size-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Disclosures */}
                                {disclosures.length === 0 ? (
                                    <div className="border border-slate-800 rounded-xl p-10 text-center">
                                        <EyeOff className="size-10 text-slate-600 mx-auto mb-3" />
                                        <p className="text-lg font-medium text-slate-300">No Disclosures Yet</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            No selective disclosures have been submitted for this commitment.
                                        </p>
                                        <Link
                                            to="/disclosure"
                                            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg text-sm active:scale-95"
                                        >
                                            <Eye className="size-4" /> Create Disclosure
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Disclosed Properties</h3>
                                        {disclosures.map((d) => (
                                            <DisclosureCard
                                                key={d.index}
                                                disclosure={d}
                                                expanded={expandedIndex === d.index}
                                                onToggle={() => setExpandedIndex(expandedIndex === d.index ? null : d.index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}

                {/* Info */}
                {!searched && (
                    <div className="mt-4 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">About Selective Disclosure</h3>
                        <ul className="text-sm text-slate-400 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                Selective disclosure lets you reveal specific metadata about a document without exposing its contents
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                Disclosable properties: <strong>email domain</strong> (hash), <strong>file size range</strong>, and <strong>file type</strong>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                Each disclosure is verified by a ZK proof — the prover cannot fake the data
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                Multiple disclosures can be made for the same commitment with different properties
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                Viewing disclosures is free — no wallet or gas needed
                            </li>
                        </ul>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

/** Individual disclosure card component */
function DisclosureCard({ disclosure, expanded, onToggle }) {
    const d = disclosure
    const revealedCount = [d.revealEmailDomain, d.revealSizeRange, d.revealFileType].filter(Boolean).length

    // Domain verification state
    const [matchedDomain, setMatchedDomain] = useState(null) // auto-detected domain
    const [autoChecking, setAutoChecking] = useState(false)
    const [autoChecked, setAutoChecked] = useState(false)
    const [manualDomain, setManualDomain] = useState('')
    const [manualResult, setManualResult] = useState(null) // null | 'match' | 'no-match'
    const [manualChecking, setManualChecking] = useState(false)

    // Auto-check common domains when card expands and email domain is revealed
    useEffect(() => {
        if (expanded && d.revealEmailDomain && !autoChecked) {
            autoCheckDomains()
        }
    }, [expanded])

    async function autoCheckDomains() {
        setAutoChecking(true)
        try {
            for (const domain of COMMON_DOMAINS) {
                const hash = await computeDomainHashFromDomain(domain)
                if (hash.toLowerCase() === d.claimedDomainHash.toLowerCase()) {
                    setMatchedDomain(domain)
                    break
                }
            }
        } catch (e) {
            console.error('Auto-check failed:', e)
        } finally {
            setAutoChecking(false)
            setAutoChecked(true)
        }
    }

    async function handleManualCheck(e) {
        e.preventDefault()
        if (!manualDomain.trim()) return
        setManualChecking(true)
        setManualResult(null)
        try {
            const hash = await computeDomainHashFromDomain(manualDomain.trim())
            if (hash.toLowerCase() === d.claimedDomainHash.toLowerCase()) {
                setManualResult('match')
                setMatchedDomain(manualDomain.trim().replace(/^.*@/, ''))
            } else {
                setManualResult('no-match')
            }
        } catch (e) {
            console.error('Manual domain check failed:', e)
            toast.error('Failed to compute domain hash')
        } finally {
            setManualChecking(false)
        }
    }

    return (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: d.index * 0.05 }}
            className="border border-slate-800 rounded-xl overflow-hidden"
        >
            {/* Header - clickable */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-900/50 transition text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="size-9 bg-purple-600/20 border border-purple-600/30 rounded-lg flex items-center justify-center">
                        <Eye className="size-4 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            Disclosure #{d.index + 1}
                        </p>
                        <p className="text-xs text-slate-500">
                            {formatTimestamp(d.timestamp)} · {revealedCount} propert{revealedCount !== 1 ? 'ies' : 'y'} revealed
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Mini badges */}
                    <div className="hidden sm:flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${d.revealEmailDomain ? 'bg-green-900/40 text-green-400 border border-green-700/50' : 'bg-slate-900/50 text-slate-600 border border-slate-800'}`}>
                            Email
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${d.revealSizeRange ? 'bg-green-900/40 text-green-400 border border-green-700/50' : 'bg-slate-900/50 text-slate-600 border border-slate-800'}`}>
                            Size
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${d.revealFileType ? 'bg-green-900/40 text-green-400 border border-green-700/50' : 'bg-slate-900/50 text-slate-600 border border-slate-800'}`}>
                            Type
                        </span>
                    </div>
                    {expanded ? <ChevronUp className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
                </div>
            </button>

            {/* Expanded details */}
            {expanded && (
                <div className="border-t border-slate-800 p-5 space-y-4">
                    {/* Email Domain */}
                    <div className={`rounded-lg p-4 ${d.revealEmailDomain ? 'bg-green-900/10 border border-green-800/30' : 'bg-slate-900/30 border border-slate-800'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Mail className={`size-4 ${d.revealEmailDomain ? 'text-green-400' : 'text-slate-600'}`} />
                            <p className="text-sm font-medium">Email Domain</p>
                            {d.revealEmailDomain ? (
                                <span className="ml-auto text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded">Revealed</span>
                            ) : (
                                <span className="ml-auto text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded">Hidden</span>
                            )}
                        </div>
                        {d.revealEmailDomain ? (
                            <div className="space-y-3">
                                {/* Matched domain display */}
                                {matchedDomain ? (
                                    <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-3">
                                        <CheckCircle className="size-5 text-green-400 shrink-0" />
                                        <div>
                                            <p className="text-green-400 font-semibold text-lg">@{matchedDomain}</p>
                                            <p className="text-xs text-green-400/70">Domain verified via Pedersen hash match</p>
                                        </div>
                                    </div>
                                ) : autoChecking ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Loader2 className="size-4 animate-spin" />
                                        Checking common email domains...
                                    </div>
                                ) : autoChecked ? (
                                    <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/30 rounded-lg px-4 py-2.5 text-sm text-amber-400">
                                        <AlertCircle className="size-4 shrink-0" />
                                        Not a common provider. Use the verifier below to check a specific domain.
                                    </div>
                                ) : null}

                                {/* Raw hash (collapsible) */}
                                <details className="group">
                                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 flex items-center gap-1">
                                        <Hash className="size-3" /> Domain Hash (Pedersen)
                                    </summary>
                                    <p className="text-sm font-mono text-slate-400 break-all mt-1">{d.claimedDomainHash}</p>
                                </details>

                                {/* Manual domain verifier */}
                                {!matchedDomain && (
                                    <form onSubmit={handleManualCheck} className="mt-2">
                                        <p className="text-xs text-slate-400 mb-1.5">Verify a specific domain:</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={manualDomain}
                                                onChange={e => setManualDomain(e.target.value)}
                                                placeholder="e.g. company.com or user@company.com"
                                                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:border-green-500 focus:outline-none transition"
                                            />
                                            <button
                                                type="submit"
                                                disabled={manualChecking || !manualDomain.trim()}
                                                className="px-4 py-2 bg-green-600/20 border border-green-600/30 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                {manualChecking ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                                                Check
                                            </button>
                                        </div>
                                        {manualResult === 'no-match' && (
                                            <div className="flex items-center gap-1.5 mt-2 text-sm text-red-400">
                                                <XCircle className="size-4" /> Domain hash does not match — this is not the email domain used.
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Not disclosed in this proof</p>
                        )}
                    </div>

                    {/* Size Range */}
                    <div className={`rounded-lg p-4 ${d.revealSizeRange ? 'bg-green-900/10 border border-green-800/30' : 'bg-slate-900/30 border border-slate-800'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <HardDrive className={`size-4 ${d.revealSizeRange ? 'text-green-400' : 'text-slate-600'}`} />
                            <p className="text-sm font-medium">File Size Range</p>
                            {d.revealSizeRange ? (
                                <span className="ml-auto text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded">Revealed</span>
                            ) : (
                                <span className="ml-auto text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded">Hidden</span>
                            )}
                        </div>
                        {d.revealSizeRange ? (
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Size Range</p>
                                <p className="text-sm font-mono text-green-400">
                                    {formatSizeRange(d.claimedSizeMin, d.claimedSizeMax)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    The ZK proof guarantees the actual file size falls within this range.
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Not disclosed in this proof</p>
                        )}
                    </div>

                    {/* File Type */}
                    <div className={`rounded-lg p-4 ${d.revealFileType ? 'bg-green-900/10 border border-green-800/30' : 'bg-slate-900/30 border border-slate-800'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className={`size-4 ${d.revealFileType ? 'text-green-400' : 'text-slate-600'}`} />
                            <p className="text-sm font-medium">File Type</p>
                            {d.revealFileType ? (
                                <span className="ml-auto text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded">Revealed</span>
                            ) : (
                                <span className="ml-auto text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded">Hidden</span>
                            )}
                        </div>
                        {d.revealFileType ? (
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Claimed File Type</p>
                                <p className="text-sm font-mono text-green-400">
                                    {decodeFileType(d.claimedFileType)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    The ZK proof guarantees this matches the actual file type in the commitment.
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Not disclosed in this proof</p>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                        <Clock className="size-3" />
                        Disclosed on {formatTimestamp(d.timestamp)}
                    </div>
                </div>
            )}
        </motion.div>
    )
}
