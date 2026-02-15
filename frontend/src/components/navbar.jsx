import { useState } from "react";
import { MenuIcon, XIcon, LogOut, Wallet, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import toast from "react-hot-toast";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { login, logout, authenticated, user, ready } = usePrivy();
    const { wallets } = useWallets();
    const navigate = useNavigate();

    // Get embedded wallet from useWallets hook (most reliable)
    const embeddedWallet = wallets?.find(w => w.walletClientType === 'privy');
    // Fallback: check linkedAccounts
    const walletAddress = embeddedWallet?.address
        || user?.wallet?.address
        || user?.linkedAccounts?.find(a => a.type === 'wallet')?.address;
    const truncatedWallet = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : null;

    const navlinks = [
        { href: "/dashboard", text: "Dashboard", protected: true },
        { href: "/new-proof", text: "New Proof", protected: true },
        { href: "/disclosure", text: "Disclosure", protected: true },
        { href: "/certificate", text: "Certificate", protected: true },
        { href: "/disclosures", text: "Disclosures" },
        { href: "/verify", text: "Verify" },
    ];

    const visibleLinks = navlinks.filter(link => !link.protected || authenticated);

    return (
        <>
            <motion.nav className="sticky top-0 z-50 flex items-center justify-between w-full h-18 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur bg-black/30"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
            >
                <Link to="/" className="flex items-center gap-2">
                    <img alt="ZK-PoE logo" src="/assets/logo.svg" style={{maxHeight: '40px', maxWidth: '160px'}} />
                </Link>

                <div className="hidden lg:flex items-center gap-8 transition duration-500">
                    {visibleLinks.map((link) => (
                        <Link key={link.href} to={link.href} className="hover:text-slate-300 transition text-sm">
                            {link.text}
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-3">
                    {ready && authenticated ? (
                        <>
                            {truncatedWallet && (
                                <button
                                    onClick={() => { navigator.clipboard.writeText(walletAddress); toast.success('Wallet address copied!'); }}
                                    className="flex items-center gap-2 text-sm text-slate-400 border border-slate-700 rounded-lg px-3 py-1.5 hover:border-indigo-500 transition cursor-pointer"
                                    title="Click to copy full address"
                                >
                                    <Wallet className="size-3.5 text-indigo-400" />
                                    <span className="font-mono text-xs">{truncatedWallet}</span>
                                    <Copy className="size-3 text-slate-500" />
                                </button>
                            )}
                            <button
                                onClick={() => logout()}
                                className="flex items-center gap-2 hover:bg-slate-300/20 transition px-4 py-2 border border-slate-400 rounded-md active:scale-95 text-sm"
                            >
                                <LogOut className="size-4" /> Logout
                            </button>
                        </>
                    ) : ready ? (
                        <button
                            onClick={() => login()}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md active:scale-95"
                        >
                            Sign in with Google
                        </button>
                    ) : null}
                </div>

                <button onClick={() => setIsMenuOpen(true)} className="lg:hidden active:scale-90 transition">
                    <MenuIcon className="size-6.5" />
                </button>
            </motion.nav>

            {/* Mobile menu */}
            <div className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 lg:hidden transition-transform duration-400 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {visibleLinks.map((link) => (
                    <Link key={link.href} to={link.href} onClick={() => setIsMenuOpen(false)}>
                        {link.text}
                    </Link>
                ))}
                {authenticated ? (
                    <button
                        onClick={() => { logout(); setIsMenuOpen(false); }}
                        className="flex items-center gap-2 text-red-400"
                    >
                        <LogOut className="size-5" /> Logout
                    </button>
                ) : (
                    <button
                        onClick={() => { login(); setIsMenuOpen(false); }}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md"
                    >
                        Sign in
                    </button>
                )}
                <button onClick={() => setIsMenuOpen(false)} className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-slate-100 hover:bg-slate-200 transition text-black rounded-md flex">
                    <XIcon />
                </button>
            </div>
        </>
    );
}