import { useEffect, useState } from 'react';
import type { User } from './types';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import UserView from './components/UserView';
import AdminView from './components/AdminView';
import ScrapbookPage from './components/ScrapbookPage';

export type Page = 'home' | 'scrapbook';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('home');

  useEffect(() => {
    fetch('/api/me')
      .then(r => (r.ok ? r.json() : null))
      .then((data: User | null) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif text-lavender-500 text-xl italic">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.banned) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-lavender-50">
        <div className="bg-white rounded-2xl shadow-sm border border-lavender-200 p-10 max-w-md w-full text-center">
          <p className="font-serif text-2xl font-bold text-stone-800 mb-3">Access Revoked</p>
          <p className="text-stone-500 text-sm mb-6">
            Your access to this site has been removed. Please contact the host if you believe this is a mistake.
          </p>
          <button
            onClick={async () => { await fetch('/api/logout', { method: 'POST' }); window.location.reload(); }}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} page={page} onNavigate={setPage}>
      {page === 'scrapbook' ? (
        <ScrapbookPage user={user} />
      ) : user.is_admin ? (
        <AdminView user={user} />
      ) : (
        <UserView user={user} onNavigate={setPage} />
      )}
    </Layout>
  );
}
