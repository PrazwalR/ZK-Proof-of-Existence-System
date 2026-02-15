import { useState, useRef, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import {
    ArrowLeft, Download, Shield, ExternalLink, Image, FileDown,
    Upload as UploadIcon, Loader2, CheckCircle, Share2, Copy,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
    PROOF_OF_EXISTENCE_ADDRESS,
    PROOF_OF_EXISTENCE_ABI,
    ARBITRUM_SEPOLIA_RPC,
    ARBISCAN_URL,
} from '../lib/contracts'
import { truncateHex, formatTimestamp } from '../lib/utils'
import { downloadCertificatePNG, downloadCertificatePDF, certificateToBlob } from '../lib/certificate'
import { pinFile, pinProofToIPFS, isPinataConfigured, getIPFSUrl } from '../lib/ipfs'

export default function Certificate() {
    const { user } = usePrivy()
    const { wallets } = useWallets()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const certRef = useRef(null)

    const [commitment, setCommitment] = useState(searchParams.get('commitment') || '')
    const [proofData, setProofData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [pinning, setPinning] = useState(false)
    const [ipfsCid, setIpfsCid] = useState(null)

    const embeddedWallet = wallets?.find(w => w.walletClientType === 'privy')
    const walletAddress = embeddedWallet?.address || user?.wallet?.address

    // Auto-fetch if commitment is in URL
    useEffect(() => {
        const c = searchParams.get('commitment')
        if (c) {
            setCommitment(c)
            fetchProofData(c)
        }
    }, [searchParams])

    async function fetchProofData(commitmentHash) {
        if (!commitmentHash) return
        setLoading(true)
        try {
            const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC)
            const contract = new ethers.Contract(PROOF_OF_EXISTENCE_ADDRESS, PROOF_OF_EXISTENCE_ABI, provider)

            // Ensure proper bytes32 format
            let bytes32 = commitmentHash
            if (!bytes32.startsWith('0x')) bytes32 = '0x' + bytes32
            if (bytes32.length < 66) bytes32 = bytes32.slice(0, 2) + bytes32.slice(2).padStart(64, '0')

            const [exists, submitter, timestamp, blockNumber] = await contract.verifyExistence(bytes32)

            if (!exists) {
                toast.error('Commitment not found on-chain')
                setProofData(null)
                return
            }

            // Check for disclosures
            let disclosureCount = 0
            let disclosures = []
            try {
                disclosureCount = Number(await contract.getDisclosureCount(bytes32))
                for (let i = 0; i < disclosureCount; i++) {
                    const flags = await contract.getDisclosureFlags(bytes32, i)
                    disclosures.push({
                        index: i,
                        revealEmailDomain: flags[0],
                        revealSizeRange: flags[1],
                        revealFileType: flags[2],
                    })
                }
            } catch (e) {
                // Disclosure query may fail if no disclosures
            }

            setProofData({
                commitment: bytes32,
                exists,
                submitter,
                timestamp: Number(timestamp),
                blockNumber: Number(blockNumber),
                disclosureCount,
                disclosures,
            })

            toast.success('Proof data loaded')
        } catch (err) {
            console.error(err)
            toast.error('Failed to fetch proof data: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDownloadPNG() {
        if (!certRef.current) return
        setDownloading(true)
        try {
            await downloadCertificatePNG(certRef.current, `zkpoe-cert-${commitment.slice(0, 10)}`)
            toast.success('Certificate downloaded as PNG')
        } catch (err) {
            toast.error('Failed to generate PNG')
        } finally {
            setDownloading(false)
        }
    }

    async function handleDownloadPDF() {
        if (!certRef.current) return
        setDownloading(true)
        try {
            await downloadCertificatePDF(certRef.current, `zkpoe-cert-${commitment.slice(0, 10)}`)
            toast.success('Certificate downloaded as PDF')
        } catch (err) {
            toast.error('Failed to generate PDF')
        } finally {
            setDownloading(false)
        }
    }

    async function handlePinToIPFS() {
        if (!proofData) return
        setPinning(true)
        try {
            // 1. Pin metadata JSON
            const metaResult = await pinProofToIPFS({
                commitment: proofData.commitment,
                documentHash: '',
                txHash: '',
                timestamp: proofData.timestamp,
                contractAddress: PROOF_OF_EXISTENCE_ADDRESS,
                submitter: proofData.submitter,
            })

            // 2. Pin certificate image
            if (certRef.current) {
                const blob = await certificateToBlob(certRef.current)
                const file = new File([blob], `zkpoe-cert-${commitment.slice(0, 10)}.png`, { type: 'image/png' })
                const imgResult = await pinFile(file, `zkpoe-cert-img-${commitment.slice(0, 10)}`)
                setIpfsCid(imgResult.cid)
                toast.success(`Certificate pinned to IPFS!\nCID: ${imgResult.cid}`)
            } else {
                setIpfsCid(metaResult.cid)
                toast.success(`Metadata pinned to IPFS!\nCID: ${metaResult.cid}`)
            }
        } catch (err) {
            console.error(err)
            if (err.message.includes('VITE_PINATA_JWT')) {
                toast.error('Pinata JWT not configured. Add VITE_PINATA_JWT to your .env file.')
            } else {
                toast.error('Failed to pin to IPFS: ' + err.message)
            }
        } finally {
            setPinning(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto mt-24 mb-20">
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 70 }}
            >
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
                >
                    <ArrowLeft className="size-4" /> Back to Dashboard
                </button>

                <h1 className="text-3xl font-semibold mb-2">Proof Certificate</h1>
                <p className="text-slate-400 mb-8">
                    Generate a verifiable certificate for your proof of existence
                </p>

                {/* Commitment Input */}
                {!proofData && (
                    <div className="border border-slate-800 rounded-xl p-8 mb-8">
                        <label className="text-sm font-medium text-slate-300 mb-3 block">
                            Enter Commitment Hash
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={commitment}
                                onChange={e => setCommitment(e.target.value)}
                                placeholder="0x..."
                                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono focus:border-indigo-500 focus:outline-none transition"
                            />
                            <button
                                onClick={() => fetchProofData(commitment)}
                                disabled={loading || !commitment}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
                                Fetch
                            </button>
                        </div>
                    </div>
                )}

                {/* Certificate Preview */}
                {proofData && (
                    <>
                        {/* The actual certificate — uses inline styles for html2canvas compatibility (no oklch) */}
                        <div
                            ref={certRef}
                            style={{
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                                border: '1px solid #334155',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                marginBottom: '32px',
                                color: '#ffffff',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                            }}
                        >
                            {/* Header */}
                            <div style={{ padding: '40px 40px 24px', textAlign: 'center', borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '48px', height: '48px',
                                        backgroundColor: 'rgba(79,70,229,0.3)',
                                        border: '1px solid rgba(99,102,241,0.5)',
                                        borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Shield style={{ width: '28px', height: '28px', color: '#818cf8' }} />
                                    </div>
                                </div>
                                <h2 style={{
                                    fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em',
                                    background: 'linear-gradient(to right, #818cf8, #a78bfa, #f472b6)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>
                                    Zero-Knowledge Proof of Existence
                                </h2>
                                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
                                    This certificate verifies that a document commitment was recorded on the blockchain
                                    using zero-knowledge cryptographic proofs.
                                </p>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '32px 40px' }}>
                                {/* Commitment */}
                                <div style={{
                                    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                                    padding: '20px', border: '1px solid rgba(51,65,85,0.5)', marginBottom: '20px',
                                }}>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                        Pedersen Commitment
                                    </p>
                                    <p style={{ fontSize: '13px', fontFamily: 'monospace', color: '#818cf8', wordBreak: 'break-all', lineHeight: '1.6' }}>
                                        {proofData.commitment}
                                    </p>
                                </div>

                                {/* Details Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(51,65,85,0.5)' }}>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Verified On</p>
                                        <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>{formatTimestamp(proofData.timestamp)}</p>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(51,65,85,0.5)' }}>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Block Number</p>
                                        <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>#{proofData.blockNumber.toLocaleString()}</p>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(51,65,85,0.5)' }}>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Network</p>
                                        <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
                                            Arbitrum Sepolia
                                        </p>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(51,65,85,0.5)' }}>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Submitter</p>
                                        <p style={{ fontSize: '14px', fontFamily: 'monospace', color: '#818cf8' }}>{truncateHex(proofData.submitter, 6)}</p>
                                    </div>
                                </div>

                                {/* Disclosures */}
                                {proofData.disclosureCount > 0 && (
                                    <div style={{
                                        backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                                        padding: '20px', border: '1px solid rgba(51,65,85,0.5)', marginBottom: '20px',
                                    }}>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                                            Selective Disclosures ({proofData.disclosureCount})
                                        </p>
                                        <div>
                                            {proofData.disclosures.map((d, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                                                    <CheckCircle style={{ width: '14px', height: '14px', color: '#4ade80' }} />
                                                    <span style={{ color: '#cbd5e1' }}>
                                                        Disclosure #{i + 1}:
                                                        {d.revealEmailDomain && ' Email Domain'}
                                                        {d.revealSizeRange && ' Size Range'}
                                                        {d.revealFileType && ' File Type'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Verification */}
                                <div style={{
                                    backgroundColor: 'rgba(20,83,45,0.2)', border: '1px solid rgba(21,128,61,0.4)',
                                    borderRadius: '12px', padding: '20px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <CheckCircle style={{ width: '24px', height: '24px', color: '#4ade80', flexShrink: 0 }} />
                                        <div>
                                            <p style={{ color: '#4ade80', fontWeight: '600', fontSize: '14px' }}>
                                                Cryptographically Verified
                                            </p>
                                            <p style={{ color: 'rgba(74,222,128,0.7)', fontSize: '12px', marginTop: '2px' }}>
                                                This commitment was verified on-chain using UltraHonk ZK proofs (Noir + Barretenberg)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: '20px 40px',
                                borderTop: '1px solid rgba(51,65,85,0.5)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                                    <Shield style={{ width: '14px', height: '14px' }} />
                                    <span>ZK-Proof-of-Existence • Zero-Knowledge Proof System</span>
                                </div>
                                <p style={{ fontSize: '12px', color: '#64748b' }}>
                                    Contract: {truncateHex(PROOF_OF_EXISTENCE_ADDRESS, 6)}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <button
                                onClick={handleDownloadPNG}
                                disabled={downloading}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-95 disabled:opacity-50"
                            >
                                {downloading ? <Loader2 className="size-4 animate-spin" /> : <Image className="size-4" />}
                                Download PNG
                            </button>

                            <button
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 transition text-white rounded-lg font-medium active:scale-95 disabled:opacity-50"
                            >
                                {downloading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
                                Download PDF
                            </button>

                            <button
                                onClick={handlePinToIPFS}
                                disabled={pinning}
                                className="flex items-center justify-center gap-2 py-3 px-4 border border-indigo-500 text-indigo-400 hover:bg-indigo-600/10 transition rounded-lg font-medium active:scale-95 disabled:opacity-50"
                            >
                                {pinning ? <Loader2 className="size-4 animate-spin" /> : <UploadIcon className="size-4" />}
                                Pin to IPFS
                            </button>

                            <a
                                href={`${ARBISCAN_URL}/address/${PROOF_OF_EXISTENCE_ADDRESS}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-700 text-slate-300 hover:border-slate-500 transition rounded-lg font-medium active:scale-95"
                            >
                                <ExternalLink className="size-4" />
                                View on Arbiscan
                            </a>
                        </div>

                        {/* IPFS Result */}
                        {ipfsCid && (
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="border border-green-700/50 bg-green-900/10 rounded-xl p-6 mb-8"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="size-5 text-green-400" />
                                    <p className="text-green-400 font-medium">Pinned to IPFS</p>
                                </div>
                                <div className="bg-black/30 rounded-lg p-4 space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">CID (Content Identifier)</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-mono text-indigo-400 break-all">{ipfsCid}</p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(ipfsCid)
                                                    toast.success('CID copied!')
                                                }}
                                                className="shrink-0 p-1 text-slate-400 hover:text-white"
                                            >
                                                <Copy className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Gateway URL</p>
                                        <a
                                            href={getIPFSUrl(ipfsCid)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-400 hover:underline break-all"
                                        >
                                            {getIPFSUrl(ipfsCid)}
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Generate Another */}
                        <button
                            onClick={() => {
                                setProofData(null)
                                setCommitment('')
                                setIpfsCid(null)
                            }}
                            className="w-full py-3 border border-slate-700 text-slate-300 hover:border-slate-500 transition rounded-lg font-medium active:scale-95"
                        >
                            Generate Another Certificate
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    )
}
