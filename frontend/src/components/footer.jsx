import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <motion.footer className="px-6 md:px-16 lg:px-24 xl:px-32 w-full text-sm text-slate-400 mt-40"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
                <div className="sm:col-span-2 lg:col-span-1">
                    <Link to="/" className="flex items-center gap-2">
                        <img alt="ZK-PoE logo" src="/assets/logo.svg" style={{ maxHeight: '40px', maxWidth: '160px' }} />
                    </Link>
                    <p className="text-sm/7 mt-6">Zero-Knowledge Proof of Existence — privacy-preserving document timestamping powered by Noir circuits and the Arbitrum blockchain.</p>
                </div>
                <div className="flex flex-col lg:items-center lg:justify-center">
                    <div className="flex flex-col text-sm space-y-2.5">
                        <h2 className="font-semibold mb-5 text-white">Navigation</h2>
                        <Link className="hover:text-slate-300 transition" to="/">Home</Link>
                        <Link className="hover:text-slate-300 transition" to="/dashboard">Dashboard</Link>
                        <Link className="hover:text-slate-300 transition" to="/new-proof">New Proof</Link>
                        <Link className="hover:text-slate-300 transition" to="/disclosure">Disclosure</Link>
                        <Link className="hover:text-slate-300 transition" to="/certificate">Certificate</Link>
                        <Link className="hover:text-slate-300 transition" to="/verify">Verify</Link>
                    </div>
                </div>
                <div>
                    <h2 className="font-semibold text-white mb-5">Connect</h2>
                    <div className="text-sm space-y-2.5">
                        <p className="font-medium text-white">Prazwal Ratti</p>
                        <a href="mailto:prazwalr07@gmail.com" className="text-indigo-400 hover:underline block">
                            prazwalr07@gmail.com
                        </a>
                        <a href="https://github.com/PrazwalR/ZK-Proof-of-Existence-System" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline block">
                            GitHub &nearr;
                        </a>
                        <a href="https://x.com/RattiPrazwal" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline block">
                            Twitter/X &nearr;
                        </a>
                        <a href="https://sepolia.arbiscan.io/address/0x808101B5659608f58A8cEebd682D674B6d97B509" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 hover:underline block mt-4">
                            View Contract on Arbiscan &nearr;
                        </a>
                    </div>
                </div>
            </div>
            <p className="py-4 text-center border-t mt-6 border-slate-700">
                &copy; 2025 ZK-Proof-of-Existence &mdash; Built by <a href="https://github.com/PrazwalR" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Prazwal Ratti</a>
            </p>
        </motion.footer>
    );
}
