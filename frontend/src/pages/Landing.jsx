import { ArrowRight, Shield, Lock, FileCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import SectionTitle from '../components/section-title'

export default function Landing() {
    const { login, authenticated } = usePrivy()
    const navigate = useNavigate()

    const handleGetStarted = () => {
        if (authenticated) {
            navigate('/dashboard')
        } else {
            login()
        }
    }

    const features = [
        {
            icon: <Shield className="size-6 text-indigo-400" />,
            title: 'Zero-Knowledge Proofs',
            description:
                'Prove document existence without revealing its contents. Your files never leave your device.',
        },
        {
            icon: <Lock className="size-6 text-indigo-400" />,
            title: 'Pedersen Commitments',
            description:
                'Cryptographically bind to your document with information-theoretic hiding. Unbreakable privacy.',
        },
        {
            icon: <FileCheck className="size-6 text-indigo-400" />,
            title: 'On-Chain Timestamps',
            description:
                'Immutable blockchain timestamps on Arbitrum. Permanent, tamper-proof proof of existence.',
        },
    ]

    const steps = [
        {
            step: '01',
            title: 'Upload Document',
            description: 'SHA-256 hash computed locally in your browser. File never uploaded.',
        },
        {
            step: '02',
            title: 'Generate ZK Proof',
            description: 'Noir circuit creates a zero-knowledge proof with Pedersen commitment.',
        },
        {
            step: '03',
            title: 'Submit On-Chain',
            description: 'Proof verified by smart contract. Timestamp permanently recorded.',
        },
        {
            step: '04',
            title: 'Verify Anytime',
            description: 'Anyone can verify your commitment exists on-chain. No document needed.',
        },
    ]

    return (
        <div className="flex flex-col items-center">
            {/* Hero */}
            <section className="flex flex-col items-center mt-32 mb-20">
                <motion.div
                    className="flex items-center gap-2 border border-slate-600 text-gray-50 rounded-full px-4 py-2"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 320, damping: 70 }}
                >
                    <div className="size-2.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm">Deployed on Arbitrum Sepolia</span>
                </motion.div>

                <motion.h1
                    className="text-center text-5xl leading-tight md:text-6xl md:leading-[70px] mt-6 font-semibold max-w-3xl"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 240, damping: 70 }}
                >
                    Prove Document Existence{' '}
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                        Without Revealing Content
                    </span>
                </motion.h1>

                <motion.p
                    className="text-center text-lg text-slate-400 max-w-xl mt-4"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 320, damping: 70 }}
                >
                    Zero-knowledge proofs meet blockchain timestamps. Create immutable proof that a document
                    existed at a specific time — with complete privacy.
                </motion.p>

                <motion.div
                    className="flex items-center gap-4 mt-8"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 320, damping: 70 }}
                >
                    <button
                        onClick={handleGetStarted}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white active:scale-95 rounded-lg px-7 h-12 font-medium"
                    >
                        {authenticated ? 'Go to Dashboard' : 'Get Started'} <ArrowRight className="size-5" />
                    </button>
                    <button
                        onClick={() => navigate('/verify')}
                        className="border border-slate-400 active:scale-95 hover:bg-white/10 transition rounded-lg px-8 h-12"
                    >
                        Verify a Proof
                    </button>
                </motion.div>
            </section>

            {/* Features */}
            <section className="w-full max-w-5xl mb-20">
                <SectionTitle
                    title="Privacy-first verification"
                    description="Built with Noir circuits, Pedersen commitments, and UltraHonk proofs on the BN254 curve."
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="border border-slate-800 rounded-xl p-6 hover:border-indigo-600/50 transition"
                            initial={{ y: 100, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: index * 0.15,
                                type: 'spring',
                                stiffness: 320,
                                damping: 70,
                            }}
                        >
                            <div className="size-12 p-3 bg-indigo-600/20 border border-indigo-600/30 rounded-lg flex items-center justify-center">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-medium text-slate-200 mt-4">{feature.title}</h3>
                            <p className="text-sm text-slate-400 mt-2">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How it Works */}
            <section className="w-full max-w-5xl mb-32">
                <SectionTitle
                    title="How it works"
                    description="Four simple steps to create an immutable, privacy-preserving proof of existence."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.step}
                            className="relative border border-slate-800 rounded-xl p-6"
                            initial={{ y: 100, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: index * 0.12,
                                type: 'spring',
                                stiffness: 320,
                                damping: 70,
                            }}
                        >
                            <span className="text-4xl font-bold text-indigo-600/30">{step.step}</span>
                            <h3 className="text-base font-medium text-slate-200 mt-3">{step.title}</h3>
                            <p className="text-sm text-slate-400 mt-2">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    )
}
