import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { FaRegMoon, FaRegSun, FaRegUserCircle } from 'react-icons/fa';
import { requestOwnerAccess } from '../services/ownerService';

// -------------------- LAYOUT --------------------
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dark, setDark] = useState<boolean>(false);
    const { user } = useAuth();
    const { push } = useToast();

    // Toggle dark mode on <html> element
    useEffect(() => {
        const root = document.documentElement;
        dark ? root.classList.add('dark') : root.classList.remove('dark');
    }, [dark]);

    // Toast event listener
    useEffect(() => {
        const handler = (e: any) => push(e.detail.message, e.detail.type);
        window.addEventListener('toast', handler as any);
        return () => window.removeEventListener('toast', handler as any);
    }, [push]);

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 transition-colors">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-900/80 shadow-md backdrop-blur border-b border-neutral-200 dark:border-neutral-800 rounded-b-xl">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-2xl text-accent-700 dark:text-accent-400">
                        <span className="inline-block bg-gradient-to-tr from-accent-500 to-accent-700 rounded-full p-2 shadow-md">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3L2 9.5V21h20V9.5L12 3z" fill="#fbbf24"/>
                                <path d="M12 3v18" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </span>
                        VillaRent
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-2 md:gap-4 text-base font-medium">
                        <Link to="/" className="px-3 py-2 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">Home</Link>

                        {user?.roles?.includes('Owner') && (
                            <>
                                <Link to="/submit" className="px-3 py-2 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">List your property</Link>
                                <Link to="/owner" className="px-3 py-2 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">Owner</Link>
                            </>
                        )}

                        {user?.roles?.includes('Admin') && <AdminDropdown />}
                        <AuthNav />

                        {/* Dark Mode Toggle */}
                        <button
                            aria-label="Toggle dark mode"
                            onClick={() => setDark(v => !v)}
                            className="ml-2 p-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow hover:scale-105 transition"
                        >
                            {dark ? <FaRegSun className="text-yellow-400" /> : <FaRegMoon className="text-neutral-700" />}
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

// -------------------- AUTH NAV --------------------
const AuthNav: React.FC = () => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const { push } = useToast();
    const [loading, setLoading] = useState(false);
    const [requested, setRequested] = useState(false);

    if (!user) return (
        <>
            <Link to="/login" className="px-3 py-2 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">Sign in</Link>
            <Link to="/register" className="px-3 py-2 rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition">Create account</Link>
        </>
    );

    const isNormal = !user.roles?.includes('Owner') && !user.roles?.includes('Admin');

    const handleRequestOwner = async () => {
        setLoading(true);
        try {
            await requestOwnerAccess();
            setRequested(true);
            push('Request submitted. Await admin approval.', 'success');
        } catch (e: any) {
            push(e?.response?.data?.message || 'Request failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">
                <FaRegUserCircle className="text-xl" />
                <span className="hidden md:inline text-sm text-neutral-700 dark:text-neutral-200">{user.email}</span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
                    <div className="px-4 py-2 text-xs text-neutral-500">
                        Signed in as<br/><span className="font-medium">{user.email}</span>
                    </div>
                    {user.roles?.includes('Admin') && (
                        <Link to="/admin" className="block px-4 py-2 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">Admin</Link>
                    )}
                    {isNormal && (
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition disabled:opacity-60"
                            onClick={handleRequestOwner}
                            disabled={loading || requested}
                        >
                            {requested ? 'Request sent' : loading ? 'Requesting...' : 'Request Owner Access'}
                        </button>
                    )}
                    <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">Sign out</button>
                </div>
            )}
        </div>
    );
};

// -------------------- ADMIN DROPDOWN --------------------
const AdminDropdown: React.FC = () => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="px-3 py-2 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/30 transition font-semibold"
            >
                Admin
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
                    <Link to="/admin" className="block px-4 py-2 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">Dashboard</Link>
                    <Link to="/admin/reservations" className="block px-4 py-2 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">Reservations</Link>
                    <Link to="/admin/submissions" className="block px-4 py-2 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">Submissions</Link>
                    <Link to="/admin/owner-requests" className="block px-4 py-2 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition">Owner Requests</Link>
                </div>
            )}
        </div>
    );
};

// -------------------- FOOTER --------------------
const Footer: React.FC = () => {
    const { user } = useAuth();
    return (
        <footer className="border-t border-neutral-200 dark:border-neutral-800 py-10 text-neutral-600 dark:text-neutral-300">
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-6">
                <div>
                    <div className="text-xl font-semibold">VillaRent</div>
                    <p className="text-sm mt-2">Premium villas and unique stays. Book with confidence.</p>
                </div>
                <div>
                    <div className="font-medium mb-2">Explore</div>
                    <ul className="space-y-1 text-sm">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/reservations">Browse Villas</Link></li>
                        {user?.roles?.includes('Owner') && (
                            <li><Link to="/submit">List your property</Link></li>
                        )}
                    </ul>
                </div>
                <div>
                    <div className="font-medium mb-2">Company</div>
                    <ul className="space-y-1 text-sm">
                        <li><a href="#">About</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <div className="font-medium mb-2">Follow</div>
                    <div className="flex gap-3 text-sm">
                        <a href="#" aria-label="Instagram">IG</a>
                        <a href="#" aria-label="Facebook">FB</a>
                        <a href="#" aria-label="Twitter">X</a>
                    </div>
                </div>
            </div>
            <div className="text-center text-xs mt-6">© {new Date().getFullYear()} VillaRent</div>
        </footer>
    );
};

export default Layout;
