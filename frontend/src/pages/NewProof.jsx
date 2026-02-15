import { useState, useCallback } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import { Upload, Hash, Shield, Send, CheckCircle, ArrowLeft, FileText, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    PROOF_OF_EXISTENCE_ADDRESS,
    PROOF_OF_EXISTENCE_ABI,
} from '../lib/contracts'
import {
    hashDocument,
    truncateToField,
    generateSalt,
    timestampToBytes32,
    truncateHex,
    formatFileSize,
} from '../lib/utils'
import {
    computeCommitment,
    generateProof,
    proofToHex,
    commitmentToBytes32,
} from '../lib/noir'

const STEPS = ['Upload', 'Hash & Commit', 'Generate Proof', 'Submit']

export default function NewProof() {
    const { user } = usePrivy()
    const { wallets } = useWallets()
    const navigate = useNavigate()

    const [step, setStep] = useState(0)
    const [file, setFile] = useState(null)
    const [documentHash, setDocumentHash] = useState(null)
    const [fieldHash, setFieldHash] = useState(null)
    const [salt, setSalt] = useState(null)
    const [commitment, setCommitment] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [txHash, setTxHash] = useState(null)
    const [proofHex, setProofHex] = useState(null)
    const [proofProgress, setProofProgress] = useState('')
    const [proofTimestamp, setProofTimestamp] = useState(null)

    // Step 1: File upload
    const handleFileUpload = useCallback(async (e) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        if (selectedFile.size > 50 * 1024 * 1024) {
            toast.error('File too large. Maximum size is 50MB.')
            return
        }

        setFile(selectedFile)
        setProcessing(true)

        try {
            const hash = await hashDocument(selectedFile)
            const field = truncateToField(hash)
            setDocumentHash(hash)
            setFieldHash(field)
            toast.success('Document hashed successfully')
            setStep(1)
        } catch (error) {
            console.error('Error hashing document:', error)
            toast.error('Failed to hash document')
        } finally {
            setProcessing(false)
        }
    }, [])

    // Step 2: Generate Pedersen commitment via NoirJS WASM
    const handleGenerateCommitment = async () => {
        setProcessing(true)
        try {
            const newSalt = generateSalt()
            setSalt(newSalt)

            // Compute real Pedersen commitment using commitment_helper circuit
            toast.loading('Computing Pedersen commitment via WASM...', { id: 'commit' })
            const commitmentValue = await computeCommitment(fieldHash, newSalt)
            setCommitment(commitmentValue)
            toast.success('Pedersen commitment computed!', { id: 'commit' })
            setStep(2)
        } catch (error) {
            console.error('Error generating commitment:', error)
            toast.error('Failed to generate commitment: ' + error.message, { id: 'commit' })
        } finally {
            setProcessing(false)
        }
    }

    // Step 3: Generate real ZK proof via NoirJS + bb.js WASM
    const handleGenerateProof = async () => {
        setProcessing(true)
        setProofProgress('Initializing...')
        try {
            const timestamp = Math.floor(Date.now() / 1000)
            setProofTimestamp(timestamp)

            const result = await generateProof(
                fieldHash,
                salt,
                commitment,
                timestamp,
                (stage) => setProofProgress(stage),
            )

            const hex = proofToHex(result.proof)
            setProofHex(hex)
            toast.success(`Proof generated! (${result.proof.length} bytes)`)
            setStep(3)
        } catch (error) {
            console.error('Error generating proof:', error)
            toast.error('Proof generation failed: ' + error.message)
        } finally {
            setProcessing(false)
            setProofProgress('')
        }
    }

    // Step 4: Submit real proof to blockchain
    const handleSubmit = async () => {
        setProcessing(true)
        try {
            const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy')
            if (!embeddedWallet) {
                toast.error('No embedded wallet found. Please log in again.')
                return
            }

            await embeddedWallet.switchChain(421614)
            const eip1193Provider = await embeddedWallet.getEthereumProvider()
            const provider = new ethers.BrowserProvider(eip1193Provider)
            const signer = await provider.getSigner()

            const contract = new ethers.Contract(
                PROOF_OF_EXISTENCE_ADDRESS,
                PROOF_OF_EXISTENCE_ABI,
                signer
            )

            const commitmentBytes32 = commitmentToBytes32(commitment)
            const timestampField = timestampToBytes32(proofTimestamp)

            toast.loading('Submitting proof to Arbitrum Sepolia...', { id: 'tx' })

            const tx = await contract.submitProof(proofHex, commitmentBytes32, timestampField)
            setTxHash(tx.hash)
            toast.loading('Waiting for confirmation...', { id: 'tx' })

            await tx.wait()
            toast.success('Proof verified & recorded on-chain!', { id: 'tx' })
            setStep(4)
        } catch (error) {
            console.error('Error submitting proof:', error)
            const msg = error.shortMessage || error.message || 'Unknown error'
            if (msg.includes('InvalidProof')) {
                toast.error('On-chain verification failed. The proof may be invalid.', { id: 'tx' })
            } else if (msg.includes('CommitmentAlreadyExists')) {
                toast.error('This commitment already exists on-chain.', { id: 'tx' })
            } else {
                toast.error('Transaction failed: ' + msg, { id: 'tx' })
            }
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto mt-24 mb-20">
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 70 }}
            >
                {/* Back button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
                >
                    <ArrowLeft className="size-4" /> Back to Dashboard
                </button>

                <h1 className="text-3xl font-semibold mb-2">Create New Proof</h1>
                <p className="text-slate-400 mb-8">
                    Generate a zero-knowledge proof of existence for your document
                </p>

                {/* Progress Steps */}
                <div className="flex items-center mb-12">
                    {STEPS.map((label, index) => (
                        <div key={label} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`size-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index <= step
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-800 text-slate-500'
                                        }`}
                                >
                                    {index < step ? <CheckCircle className="size-5" /> : index + 1}
                                </div>
                                <span
                                    className={`text-xs mt-2 ${index <= step ? 'text-indigo-400' : 'text-slate-500'
                                        }`}
                                >
                                    {label}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`h-0.5 flex-1 mx-2 -mt-5 ${index < step ? 'bg-indigo-600' : 'bg-slate-800'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="border border-slate-800 rounded-xl p-8">
                    {/* Step 1: Upload */}
                    {step === 0 && (
                        <div className="flex flex-col items-center">
                            <label
                                htmlFor="file-upload"
                                className={`w-full border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${file ? 'border-indigo-600 bg-indigo-600/5' : 'border-slate-700 hover:border-slate-500'
                                    }`}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                />
                                {processing ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="size-12 text-indigo-500 animate-spin" />
                                        <p className="text-slate-400">Computing SHA-256 hash...</p>
                                    </div>
                                ) : file ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <FileText className="size-12 text-indigo-400" />
                                        <div>
                                            <p className="text-lg font-medium">{file.name}</p>
                                            <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <Upload className="size-12 text-slate-500" />
                                        <div>
                                            <p className="text-lg font-medium">Upload Document</p>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Drag & drop or click to select (PDF, DOC, TXT, Images — max 50MB)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </label>
                            <p className="text-xs text-slate-500 mt-4">
                                ⚠️ Your file is hashed locally. It never leaves your browser.
                            </p>
                        </div>
                    )}

                    {/* Step 2: Hash & Commitment */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Document</p>
                                    <p className="text-sm font-medium">
                                        {file?.name} ({formatFileSize(file?.size || 0)})
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                        <Hash className="size-3" /> SHA-256 Hash
                                    </p>
                                    <p className="text-sm font-mono text-indigo-400 break-all">{documentHash}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                        <Shield className="size-3" /> Field Element (31 bytes)
                                    </p>
                                    <p className="text-sm font-mono text-purple-400 break-all">{fieldHash}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerateCommitment}
                                disabled={processing}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <Shield className="size-5" />
                                )}
                                Generate Pedersen Commitment
                            </button>
                        </div>
                    )}

                    {/* Step 3: Generate Proof */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Commitment</p>
                                    <p className="text-sm font-mono text-indigo-400 break-all">{commitment}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Salt (save this!)</p>
                                    <p className="text-sm font-mono text-amber-400 break-all">{salt}</p>
                                </div>
                                <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                                    <p className="text-amber-400 text-sm font-medium">⚠️ Save your salt securely!</p>
                                    <p className="text-amber-400/70 text-xs mt-1">
                                        You need the salt + document to prove ownership later. It cannot be recovered.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerateProof}
                                disabled={processing}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        Generating ZK Proof...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="size-5" />
                                        Generate Zero-Knowledge Proof
                                    </>
                                )}
                            </button>
                            {processing && (
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-indigo-400">{proofProgress}</p>
                                    <p className="text-xs text-slate-500">
                                        Running Noir circuit + UltraHonk proving in browser via WASM...
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Submit */}
                    {step === 3 && !txHash && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                                    <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                                        <CheckCircle className="size-4" /> UltraHonk proof generated ({proofHex ? (proofHex.length - 2) / 2 : 0} bytes)
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Commitment (Pedersen)</p>
                                    <p className="text-sm font-mono text-indigo-400 break-all">{commitment}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Proof Preview</p>
                                    <p className="text-xs font-mono text-slate-500 break-all">{proofHex ? proofHex.slice(0, 130) + '...' : ''}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Network</p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="size-2 bg-green-500 rounded-full" />
                                        Arbitrum Sepolia (Chain ID: 421614)
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Estimated Cost</p>
                                    <p className="text-sm">~$0.03 - $0.05</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 transition text-white rounded-lg font-medium active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-5" />
                                        Submit Proof to Blockchain
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Success */}
                    {step >= 4 && txHash && (
                        <div className="flex flex-col items-center py-8 space-y-6">
                            <div className="size-20 bg-green-600/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="size-10 text-green-400" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold">Proof Submitted!</h2>
                                <p className="text-slate-400 mt-2">
                                    Your document's existence has been permanently recorded on Arbitrum.
                                </p>
                            </div>
                            <div className="w-full space-y-3">
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Transaction Hash</p>
                                    <a
                                        href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-mono text-indigo-400 hover:underline break-all"
                                    >
                                        {txHash}
                                    </a>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Commitment</p>
                                    <p className="text-sm font-mono text-indigo-400 break-all">{commitment}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-[0.98]"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate(`/certificate?commitment=${encodeURIComponent(commitment)}`)}
                                    className="flex-1 py-3 border border-indigo-500 text-indigo-400 hover:bg-indigo-600/10 transition rounded-lg font-medium active:scale-[0.98]"
                                >
                                    Generate Certificate
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
