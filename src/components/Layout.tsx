import type { ReactNode } from 'react';
import type { User } from '../types';
import type { Page } from '../App';

interface Props {
  user: User;
  page: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

export default function Layout({ user, page, onNavigate, children }: Props) {
  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-lavender-50">
      <header className="bg-white border-b border-lavender-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => onNavigate('home')} className="text-left">
            <h1 className="font-serif text-xl font-bold text-stone-800">
              Lorraine's <span className="text-lavender-600">90th Birthday</span>
            </h1>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500 hidden sm:block">
              {user.name}
              {user.is_admin && (
                <span className="ml-2 bg-gold-100 text-gold-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-0">
          {(['home', 'scrapbook'] as Page[]).map(p => (
            <button
              key={p}
              onClick={() => onNavigate(p)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                page === p
                  ? 'border-lavender-500 text-lavender-700'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {p === 'home' ? 'Home' : 'Scrapbook'}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="relative h-44 sm:h-56 overflow-hidden rounded-2xl">
          <img
            src="/bike.webp"
            alt="Lavender fields at sunset"
            className="w-full h-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lavender-950/10 to-lavender-950/50" />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
