import { usePrivy } from '@privy-io/react-auth'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    const { ready, authenticated } = usePrivy()

    if (!ready) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            </div>
        )
    }

    if (!authenticated) {
        return <Navigate to="/" replace />
    }

    return children
}
