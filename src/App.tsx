import { useEffect, useState } from 'react';
import type { User } from './types';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import UserView from './components/UserView';
import AdminView from './components/AdminView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout user={user}>
      {user.is_admin ? <AdminView user={user} /> : <UserView user={user} />}
    </Layout>
  );
}
