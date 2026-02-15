import { Routes, Route } from 'react-router-dom'
import LenisScroll from './components/lenis-scroll'
import Navbar from './components/navbar'
import Footer from './components/footer'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import NewProof from './pages/NewProof'
import Verify from './pages/Verify'
import Disclosure from './pages/Disclosure'
import ViewDisclosures from './pages/ViewDisclosures'
import Certificate from './pages/Certificate'
import ProtectedRoute from './components/protected-route'

export default function App() {
    return (
        <>
            <LenisScroll />
            <Navbar />
            <main className="px-6 md:px-16 lg:px-24 xl:px-32 min-h-screen">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/new-proof" element={<ProtectedRoute><NewProof /></ProtectedRoute>} />
                    <Route path="/disclosure" element={<ProtectedRoute><Disclosure /></ProtectedRoute>} />
                    <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
                    <Route path="/disclosures" element={<ViewDisclosures />} />
                    <Route path="/verify" element={<Verify />} />
                </Routes>
            </main>
            <Footer />
        </>
    )
}