import { useState, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import { Plus, ExternalLink, Copy, FileCheck, Wallet, Award, Eye, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    PROOF_OF_EXISTENCE_ADDRESS,
    PROOF_OF_EXISTENCE_ABI,
    ARBITRUM_SEPOLIA_RPC,
    ARBISCAN_URL,
} from '../lib/contracts'
import { truncateHex, formatTimestamp } from '../lib/utils'

export default function Dashboard() {
    const { user, createWallet } = usePrivy()
    const { wallets } = useWallets()
    const navigate = useNavigate()
    const [commitments, setCommitments] = useState([])
    const [loading, setLoading] = useState(true)
    const [creatingWallet, setCreatingWallet] = useState(false)

    const embeddedWallet = wallets?.find(w => w.walletClientType === 'privy')
    const walletAddress = embeddedWallet?.address
        || user?.wallet?.address
        || user?.linkedAccounts?.find(a => a.type === 'wallet')?.address

    useEffect(() => {
        if (walletAddress) {
            loadCommitments()
        } else {
            setLoading(false)
        }
    }, [walletAddress])

    async function loadCommitments() {
        try {
            const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC)
            const contract = new ethers.Contract(PROOF_OF_EXISTENCE_ADDRESS, PROOF_OF_EXISTENCE_ABI, provider)

            const userCommitments = await contract.getUserCommitments(walletAddress)

            const details = await Promise.all(
                userCommitments.map(async (commitment) => {
                    const [data, disclosureCount] = await Promise.all([
                        contract.commitments(commitment),
                        contract.getDisclosureCount(commitment),
                    ])
                    return {
                        commitment,
                        submitter: data.submitter,
                        timestamp: Number(data.timestamp),
                        blockNumber: Number(data.blockNumber),
                        exists: data.exists,
                        disclosureCount: Number(disclosureCount),
                    }
                })
            )

            setCommitments(details.reverse())
        } catch (error) {
            console.error('Error loading commitments:', error)
            toast.error('Failed to load commitments')
        } finally {
            setLoading(false)
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    }

    async function handleCreateWallet() {
        setCreatingWallet(true)
        try {
            await createWallet()
            toast.success('Wallet created! Refresh to see your address.')
            window.location.reload()
        } catch (error) {
            console.error('Error creating wallet:', error)
            if (error.message?.includes('already has')) {
                toast.error('Wallet already exists. Try refreshing the page.')
                window.location.reload()
            } else {
                toast.error('Failed to create wallet: ' + (error.shortMessage || error.message))
            }
        } finally {
            setCreatingWallet(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto mt-24 mb-20">
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 70 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold">Dashboard</h1>
                        <p className="text-slate-400 mt-1">
                            {user?.email?.address || user?.google?.email || 'Authenticated'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/disclosure')}
                            className="flex items-center gap-2 border border-indigo-500 text-indigo-400 hover:bg-indigo-600/10 transition rounded-lg px-5 h-11 active:scale-95 font-medium"
                        >
                            <Eye className="size-4" /> Disclosure
                        </button>
                        <button
                            onClick={() => navigate('/new-proof')}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg px-5 h-11 active:scale-95 font-medium"
                        >
                            <Plus className="size-4" /> New Proof
                        </button>
                    </div>
                </div>

                {/* Wallet Card */}
                <div className="border border-slate-800 rounded-xl p-5 mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-10 bg-indigo-600/20 border border-indigo-600/30 rounded-lg flex items-center justify-center">
                            <Wallet className="size-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Your Wallet</p>
                            <p className="text-xs text-slate-500">Privy Embedded Wallet on Arbitrum Sepolia</p>
                        </div>
                    </div>
                    {walletAddress ? (
                        <div className="space-y-3">
                            <div className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between gap-3">
                                <p className="font-mono text-sm text-indigo-400 break-all">{walletAddress}</p>
                                <button
                                    onClick={() => copyToClipboard(walletAddress)}
                                    className="shrink-0 text-slate-400 hover:text-white transition p-2 hover:bg-slate-800 rounded-lg"
                                    title="Copy wallet address"
                                >
                                    <Copy className="size-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <a
                                    href={`${ARBISCAN_URL}/address/${walletAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                    View on Arbiscan <ExternalLink className="size-3" />
                                </a>
                                <span className="text-slate-600">|</span>
                                <span className="text-slate-400">Fund this address with Arbitrum Sepolia ETH to submit proofs</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 flex items-center justify-between">
                            <p className="text-amber-400 text-sm">⚠️ No embedded wallet found.</p>
                            <button
                                onClick={handleCreateWallet}
                                disabled={creatingWallet}
                                className="ml-4 shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white text-sm rounded-lg active:scale-95 disabled:opacity-50"
                            >
                                {creatingWallet ? 'Creating...' : 'Create Wallet'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="border border-slate-800 rounded-xl p-5">
                        <p className="text-slate-400 text-sm">Total Proofs</p>
                        <p className="text-2xl font-semibold mt-1">{commitments.length}</p>
                    </div>
                    <div className="border border-slate-800 rounded-xl p-5">
                        <p className="text-slate-400 text-sm">Network</p>
                        <p className="text-2xl font-semibold mt-1 flex items-center gap-2">
                            <span className="size-2.5 bg-green-500 rounded-full" />
                            Arbitrum Sepolia
                        </p>
                    </div>
                    <div className="border border-slate-800 rounded-xl p-5">
                        <p className="text-slate-400 text-sm">Contract</p>
                        <a
                            href={`${ARBISCAN_URL}/address/${PROOF_OF_EXISTENCE_ADDRESS}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 font-mono text-sm hover:underline mt-1 block"
                        >
                            {truncateHex(PROOF_OF_EXISTENCE_ADDRESS, 6)}
                            <ExternalLink className="size-3 inline ml-1" />
                        </a>
                    </div>
                </div>

                {/* Commitments Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800">
                        <h2 className="text-lg font-medium">Your Commitments</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                        </div>
                    ) : commitments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FileCheck className="size-12 mb-4 text-slate-600" />
                            <p className="text-lg">No proofs submitted yet</p>
                            <p className="text-sm mt-1">Create your first proof to get started</p>
                            <button
                                onClick={() => navigate('/new-proof')}
                                className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg px-5 py-2.5 active:scale-95"
                            >
                                <Plus className="size-4" /> Create Proof
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-400 border-b border-slate-800">
                                        <th className="px-6 py-3 font-medium">#</th>
                                        <th className="px-6 py-3 font-medium">Commitment</th>
                                        <th className="px-6 py-3 font-medium">Timestamp</th>
                                        <th className="px-6 py-3 font-medium">Block</th>
                                        <th className="px-6 py-3 font-medium">Disclosures</th>
                                        <th className="px-6 py-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commitments.map((item, index) => (
                                        <tr
                                            key={item.commitment}
                                            className="border-b border-slate-800/50 hover:bg-slate-900/50 transition"
                                        >
                                            <td className="px-6 py-4 text-slate-400">{index + 1}</td>
                                            <td className="px-6 py-4 font-mono text-indigo-400">
                                                {truncateHex(item.commitment, 8)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {formatTimestamp(item.timestamp)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={`${ARBISCAN_URL}/block/${item.blockNumber}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-400 hover:underline"
                                                >
                                                    {item.blockNumber}
                                                    <ExternalLink className="size-3 inline ml-1" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.disclosureCount > 0 ? (
                                                    <button
                                                        onClick={() => navigate(`/disclosures?commitment=${encodeURIComponent(item.commitment)}`)}
                                                        className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition"
                                                    >
                                                        <MessageSquare className="size-3.5" />
                                                        {item.disclosureCount}
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-600 text-sm">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => copyToClipboard(item.commitment)}
                                                        className="text-slate-400 hover:text-white transition p-1"
                                                        title="Copy commitment"
                                                    >
                                                        <Copy className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/certificate?commitment=${encodeURIComponent(item.commitment)}`)}
                                                        className="text-slate-400 hover:text-indigo-400 transition p-1"
                                                        title="Generate certificate"
                                                    >
                                                        <Award className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/disclosures?commitment=${encodeURIComponent(item.commitment)}`)}
                                                        className="text-slate-400 hover:text-purple-400 transition p-1"
                                                        title="View disclosures"
                                                    >
                                                        <Eye className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
