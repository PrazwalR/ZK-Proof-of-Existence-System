import { useState, useCallback, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import {
    Upload, Shield, Send, CheckCircle, ArrowLeft, FileText,
    Loader2, Eye, EyeOff, Mail, HardDrive, FileType, ToggleLeft, ToggleRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
    PROOF_OF_EXISTENCE_ADDRESS,
    PROOF_OF_EXISTENCE_ABI,
    ARBITRUM_SEPOLIA_RPC,
} from '../lib/contracts'
import {
    hashDocument,
    truncateToField,
    truncateHex,
    formatFileSize,
} from '../lib/utils'
import {
    computeCommitment,
    generateDisclosureProof,
    proofToHex,
    commitmentToBytes32,
} from '../lib/noir'

const STEPS = ['Upload & Metadata', 'Select Disclosures', 'Generate Proof', 'Submit']

export default function Disclosure() {
    const { user } = usePrivy()
    const { wallets } = useWallets()
    const navigate = useNavigate()

    const [step, setStep] = useState(0)
    const [file, setFile] = useState(null)
    const [documentHash, setDocumentHash] = useState(null)
    const [fieldHash, setFieldHash] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [txHash, setTxHash] = useState(null)
    const [proofProgress, setProofProgress] = useState('')
    const [proofData, setProofData] = useState(null)

    // Metadata inputs
    const [salt, setSalt] = useState('')
    const [authorEmail, setAuthorEmail] = useState('')
    const [fileType, setFileType] = useState('')

    // Disclosure toggles
    const [revealEmailDomain, setRevealEmailDomain] = useState(false)
    const [revealSizeRange, setRevealSizeRange] = useState(false)
    const [revealFileType, setRevealFileType] = useState(false)

    // Size range inputs
    const [sizeMin, setSizeMin] = useState('')
    const [sizeMax, setSizeMax] = useState('')

    // Commitment (from existing proof)
    const [commitment, setCommitment] = useState(null)
    const [existingCommitments, setExistingCommitments] = useState([])
    const [selectedCommitment, setSelectedCommitment] = useState('')

    // Load existing commitments for selection
    useEffect(() => {
        loadCommitments()
    }, [wallets])

    async function loadCommitments() {
        const embeddedWallet = wallets?.find(w => w.walletClientType === 'privy')
        const addr = embeddedWallet?.address || user?.wallet?.address
        if (!addr) return

        try {
            const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC)
            const contract = new ethers.Contract(PROOF_OF_EXISTENCE_ADDRESS, PROOF_OF_EXISTENCE_ABI, provider)
            const comms = await contract.getUserCommitments(addr)
            setExistingCommitments(comms)
        } catch (err) {
            console.error('Failed to load commitments:', err)
        }
    }

    // Step 1: File upload & metadata
    const handleFileUpload = useCallback(async (e) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return
        if (selectedFile.size > 50 * 1024 * 1024) {
            toast.error('File too large. Maximum 50MB.')
            return
        }
        setFile(selectedFile)
        setProcessing(true)
        try {
            const hash = await hashDocument(selectedFile)
            const field = truncateToField(hash)
            setDocumentHash(hash)
            setFieldHash(field)

            // Auto-detect file type
            const ext = selectedFile.name.split('.').pop()?.toLowerCase() || ''
            setFileType(ext)

            toast.success('Document hashed')
        } catch (err) {
            toast.error('Failed to hash document')
        } finally {
            setProcessing(false)
        }
    }, [])

    // Proceed from metadata step
    const handleMetadataNext = async () => {
        if (!file || !fieldHash) {
            toast.error('Please upload a document first')
            return
        }
        if (!salt) {
            toast.error('Please enter the salt from your original proof')
            return
        }
        if (!authorEmail || !authorEmail.includes('@')) {
            toast.error('Please enter a valid email address')
            return
        }

        setProcessing(true)
        try {
            // Compute commitment to verify it matches
            toast.loading('Verifying commitment...', { id: 'verify-commit' })
            const comp = await computeCommitment(fieldHash, salt)
            setCommitment(comp)

            // Check if this commitment exists on chain
            const compBytes32 = commitmentToBytes32(comp)
            const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC)
            const contract = new ethers.Contract(PROOF_OF_EXISTENCE_ADDRESS, PROOF_OF_EXISTENCE_ABI, provider)
            const [exists] = await contract.verifyExistence(compBytes32)

            if (!exists) {
                toast.error('This commitment does not exist on-chain. Submit a basic proof first.', { id: 'verify-commit' })
                return
            }

            toast.success('Commitment verified on-chain!', { id: 'verify-commit' })
            setStep(1)
        } catch (err) {
            console.error(err)
            toast.error('Failed to verify commitment: ' + err.message, { id: 'verify-commit' })
        } finally {
            setProcessing(false)
        }
    }

    // Proceed from disclosure selection
    const handleDisclosureNext = () => {
        if (!revealEmailDomain && !revealSizeRange && !revealFileType) {
            toast.error('Select at least one property to disclose')
            return
        }
        if (revealSizeRange) {
            const min = parseInt(sizeMin)
            const max = parseInt(sizeMax)
            if (isNaN(min) || isNaN(max) || min > max) {
                toast.error('Please enter valid size range (min ≤ max)')
                return
            }
            if (file.size < min || file.size > max) {
                toast.error(`File size (${file.size}) must be within claimed range [${min}, ${max}]`)
                return
            }
        }
        setStep(2)
    }

    // Step 3: Generate proof
    const handleGenerateProof = async () => {
        setProcessing(true)
        setProofProgress('Initializing...')
        try {
            const result = await generateDisclosureProof({
                documentHash: fieldHash,
                salt: salt,
                commitment: commitment,
                authorEmail: authorEmail,
                fileSize: file.size,
                fileType: fileType,
                revealEmailDomain,
                revealSizeRange,
                revealFileType,
                claimedSizeMin: revealSizeRange ? parseInt(sizeMin) : 0,
                claimedSizeMax: revealSizeRange ? parseInt(sizeMax) : 0,
            }, (stage) => setProofProgress(stage))

            setProofData(result)
            toast.success(`Disclosure proof generated! (${result.proof.length} bytes)`)
            setStep(3)
        } catch (err) {
            console.error('Disclosure proof error:', err)
            toast.error('Proof generation failed: ' + err.message)
        } finally {
            setProcessing(false)
            setProofProgress('')
        }
    }

    // Step 4: Submit to chain
    const handleSubmit = async () => {
        setProcessing(true)
        try {
            const embeddedWallet = wallets.find(w => w.walletClientType === 'privy')
            if (!embeddedWallet) {
                toast.error('No embedded wallet found.')
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

            const proofHex = proofToHex(proofData.proof)
            const commitBytes32 = commitmentToBytes32(commitment)

            // Build claimed_file_type as bytes32[20]
            const claimedFileTypeBytes32 = []
            const encoder = new TextEncoder()
            const ftBytes = revealFileType ? encoder.encode(fileType) : new Uint8Array(20)
            for (let i = 0; i < 20; i++) {
                const val = i < ftBytes.length ? ftBytes[i] : 0
                claimedFileTypeBytes32.push('0x' + BigInt(val).toString(16).padStart(64, '0'))
            }

            // Size values as bytes32
            const sizeMinB32 = '0x' + BigInt(revealSizeRange ? parseInt(sizeMin) : 0).toString(16).padStart(64, '0')
            const sizeMaxB32 = '0x' + BigInt(revealSizeRange ? parseInt(sizeMax) : 0).toString(16).padStart(64, '0')

            // Domain hash — already computed during proof generation
            const domainHashB32 = proofData.claimedDomainHash.length === 66
                ? proofData.claimedDomainHash
                : '0x' + proofData.claimedDomainHash.replace('0x', '').padStart(64, '0')

            toast.loading('Submitting disclosure to Arbitrum Sepolia...', { id: 'dtx' })

            const tx = await contract.submitDisclosure(
                proofHex,
                commitBytes32,
                revealEmailDomain,
                revealSizeRange,
                revealFileType,
                domainHashB32,
                sizeMinB32,
                sizeMaxB32,
                claimedFileTypeBytes32
            )

            setTxHash(tx.hash)
            toast.loading('Waiting for confirmation...', { id: 'dtx' })
            await tx.wait()
            toast.success('Selective disclosure submitted & verified on-chain!', { id: 'dtx' })
            setStep(4)
        } catch (err) {
            console.error('Disclosure submission error:', err)
            const msg = err.shortMessage || err.message || 'Unknown error'
            if (msg.includes('InvalidProof')) {
                toast.error('On-chain verification failed.', { id: 'dtx' })
            } else if (msg.includes('CommitmentDoesNotExist')) {
                toast.error('Commitment does not exist. Submit a basic proof first.', { id: 'dtx' })
            } else {
                toast.error('Transaction failed: ' + msg, { id: 'dtx' })
            }
        } finally {
            setProcessing(false)
        }
    }

    const ToggleSwitch = ({ enabled, onChange, label, icon: Icon, description }) => (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`w-full text-left border rounded-xl p-5 transition-all ${enabled
                ? 'border-indigo-500 bg-indigo-600/10'
                : 'border-slate-800 hover:border-slate-600'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-indigo-600/30' : 'bg-slate-800'}`}>
                        <Icon className={`size-5 ${enabled ? 'text-indigo-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                    </div>
                </div>
                {enabled ? (
                    <ToggleRight className="size-6 text-indigo-400" />
                ) : (
                    <ToggleLeft className="size-6 text-slate-500" />
                )}
            </div>
        </button>
    )

    return (
        <div className="max-w-3xl mx-auto mt-24 mb-20">
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

                <h1 className="text-3xl font-semibold mb-2">Selective Disclosure</h1>
                <p className="text-slate-400 mb-8">
                    Prove properties of your document without revealing the document itself
                </p>

                {/* Progress Steps */}
                <div className="flex items-center mb-12">
                    {STEPS.map((label, index) => (
                        <div key={label} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`size-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index <= step ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                    {index < step ? <CheckCircle className="size-5" /> : index + 1}
                                </div>
                                <span className={`text-xs mt-2 text-center ${index <= step ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    {label}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-2 -mt-5 ${index < step ? 'bg-indigo-600' : 'bg-slate-800'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="border border-slate-800 rounded-xl p-8">
                    {/* Step 1: Upload & Metadata */}
                    {step === 0 && (
                        <div className="space-y-6">
                            {/* File Upload */}
                            <label
                                htmlFor="disclosure-file"
                                className={`block w-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${file ? 'border-indigo-600 bg-indigo-600/5' : 'border-slate-700 hover:border-slate-500'}`}
                            >
                                <input
                                    id="disclosure-file"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                />
                                {processing ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="size-10 text-indigo-500 animate-spin" />
                                        <p className="text-slate-400 text-sm">Hashing document...</p>
                                    </div>
                                ) : file ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <FileText className="size-10 text-indigo-400" />
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <Upload className="size-10 text-slate-500" />
                                        <div>
                                            <p className="font-medium">Upload the same document</p>
                                            <p className="text-sm text-slate-400 mt-1">The file you submitted a basic proof for</p>
                                        </div>
                                    </div>
                                )}
                            </label>

                            {/* Salt Input */}
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">
                                    Salt (from your original proof)
                                </label>
                                <input
                                    type="text"
                                    value={salt}
                                    onChange={e => setSalt(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono focus:border-indigo-500 focus:outline-none transition"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">
                                    Author Email
                                </label>
                                <input
                                    type="email"
                                    value={authorEmail}
                                    onChange={e => setAuthorEmail(e.target.value)}
                                    placeholder="alice@example.com"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none transition"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    The email is private — only the domain hash can be selectively disclosed
                                </p>
                            </div>

                            {/* File Type */}
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">
                                    File Type
                                </label>
                                <input
                                    type="text"
                                    value={fileType}
                                    onChange={e => setFileType(e.target.value)}
                                    placeholder="pdf"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none transition"
                                />
                            </div>

                            <button
                                onClick={handleMetadataNext}
                                disabled={processing || !file || !salt}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? <Loader2 className="size-5 animate-spin" /> : <Shield className="size-5" />}
                                Verify & Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Select Disclosures */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="bg-slate-900/50 rounded-lg p-4 mb-2">
                                <p className="text-xs text-slate-400 mb-1">Verified Commitment</p>
                                <p className="text-sm font-mono text-indigo-400 break-all">{commitment}</p>
                            </div>

                            <p className="text-sm text-slate-300">
                                Choose which properties to reveal. Everything else stays private in zero-knowledge.
                            </p>

                            <ToggleSwitch
                                enabled={revealEmailDomain}
                                onChange={setRevealEmailDomain}
                                icon={Mail}
                                label="Email Domain"
                                description="Prove your email belongs to a specific domain (e.g. @mit.edu) without revealing the full address"
                            />

                            <ToggleSwitch
                                enabled={revealSizeRange}
                                onChange={setRevealSizeRange}
                                icon={HardDrive}
                                label="File Size Range"
                                description="Prove the file size falls within a specific range"
                            />

                            {revealSizeRange && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="pl-14 grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Min (bytes)</label>
                                        <input
                                            type="number"
                                            value={sizeMin}
                                            onChange={e => setSizeMin(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Max (bytes)</label>
                                        <input
                                            type="number"
                                            value={sizeMax}
                                            onChange={e => setSizeMax(e.target.value)}
                                            placeholder="10000000"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <p className="col-span-2 text-xs text-slate-500">
                                        Your file is {formatFileSize(file?.size || 0)} ({file?.size || 0} bytes)
                                    </p>
                                </motion.div>
                            )}

                            <ToggleSwitch
                                enabled={revealFileType}
                                onChange={setRevealFileType}
                                icon={FileType}
                                label="File Type"
                                description={`Prove the file type is "${fileType || '...'}"`}
                            />

                            {/* Summary */}
                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mt-4">
                                <p className="text-sm font-medium mb-2">Disclosure Summary</p>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs">
                                        {revealEmailDomain ? <Eye className="size-3 text-green-400" /> : <EyeOff className="size-3 text-slate-500" />}
                                        <span className={revealEmailDomain ? 'text-green-400' : 'text-slate-500'}>
                                            Email domain: {revealEmailDomain ? 'REVEALED' : 'HIDDEN'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        {revealSizeRange ? <Eye className="size-3 text-green-400" /> : <EyeOff className="size-3 text-slate-500" />}
                                        <span className={revealSizeRange ? 'text-green-400' : 'text-slate-500'}>
                                            Size range: {revealSizeRange ? `REVEALED (${sizeMin || 0}–${sizeMax || '∞'} bytes)` : 'HIDDEN'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        {revealFileType ? <Eye className="size-3 text-green-400" /> : <EyeOff className="size-3 text-slate-500" />}
                                        <span className={revealFileType ? 'text-green-400' : 'text-slate-500'}>
                                            File type: {revealFileType ? `REVEALED ("${fileType}")` : 'HIDDEN'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleDisclosureNext}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-[0.98]"
                            >
                                Generate Disclosure Proof
                            </button>
                        </div>
                    )}

                    {/* Step 3: Generate Proof */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                                <p className="text-amber-400 text-sm font-medium">⚠️ This proof may take 30-60 seconds</p>
                                <p className="text-amber-400/70 text-xs mt-1">
                                    The selective disclosure circuit is larger than basic timestamp. Please be patient.
                                </p>
                            </div>

                            <button
                                onClick={handleGenerateProof}
                                disabled={processing}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-medium active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        Generating Disclosure Proof...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="size-5" />
                                        Generate Selective Disclosure Proof
                                    </>
                                )}
                            </button>

                            {processing && (
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-indigo-400">{proofProgress}</p>
                                    <p className="text-xs text-slate-500">Running selective disclosure Noir circuit + UltraHonk proving via WASM...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Submit */}
                    {step === 3 && !txHash && (
                        <div className="space-y-6">
                            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                                <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                                    <CheckCircle className="size-4" />
                                    Disclosure proof generated ({proofData ? proofData.proof.length : 0} bytes)
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Commitment</p>
                                    <p className="text-sm font-mono text-indigo-400 break-all">{commitment}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Disclosures</p>
                                    <div className="space-y-1 mt-1">
                                        {revealEmailDomain && <p className="text-xs text-green-400">✓ Email domain revealed</p>}
                                        {revealSizeRange && <p className="text-xs text-green-400">✓ Size range: {sizeMin}–{sizeMax} bytes</p>}
                                        {revealFileType && <p className="text-xs text-green-400">✓ File type: {fileType}</p>}
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <p className="text-xs text-slate-400 mb-1">Network</p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="size-2 bg-green-500 rounded-full" />
                                        Arbitrum Sepolia (Chain 421614)
                                    </p>
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
                                        Submit Disclosure On-Chain
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
                                <h2 className="text-2xl font-semibold">Disclosure Submitted!</h2>
                                <p className="text-slate-400 mt-2">
                                    Your selective disclosure has been verified & recorded on Arbitrum.
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
                                    <p className="text-xs text-slate-400 mb-1">Disclosed Properties</p>
                                    <div className="space-y-1 mt-1">
                                        {revealEmailDomain && <p className="text-xs text-green-400">✓ Email domain</p>}
                                        {revealSizeRange && <p className="text-xs text-green-400">✓ File size range</p>}
                                        {revealFileType && <p className="text-xs text-green-400">✓ File type</p>}
                                    </div>
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
                                    onClick={() => navigate('/certificate')}
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
