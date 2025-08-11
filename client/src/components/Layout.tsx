import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  const { push } = useToast();
  useEffect(() => {
    const handler = (e: any) => push(e.detail.message, e.detail.type);
    window.addEventListener('toast', handler as any);
    return () => window.removeEventListener('toast', handler as any);
  }, [push]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 transition-colors">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-neutral-900/70 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight text-xl">VillaRent</Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="hover:text-accent-600">Home</Link>
            <Link to="/reservations" className="hover:text-accent-600">Book</Link>
            <Link to="/submit" className="hover:text-accent-600">List your property</Link>
            <Link to="/owner" className="hover:text-accent-600">Owner</Link>
            <AuthNav />
            <button aria-label="Toggle dark mode" onClick={() => setDark(v => !v)} className="px-3 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 shadow-soft text-sm">
              {dark ? 'Light' : 'Dark'}
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
};

const AuthNav: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return <>
    <Link to="/login" className="hover:text-accent-600">Sign in</Link>
    <Link to="/register" className="hover:text-accent-600">Create account</Link>
  </>;
  return <>
    <span className="text-sm text-neutral-500">{user.email}</span>
    {(user.roles?.includes('Admin')) && <Link to="/admin" className="hover:text-accent-600">Admin</Link>}
    <button onClick={logout} className="btn">Sign out</button>
  </>;
};

export default Layout;

const Footer: React.FC = () => {
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
            <li><Link to="/submit">List your property</Link></li>
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
}


