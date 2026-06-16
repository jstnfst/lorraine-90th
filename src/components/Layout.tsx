import type { ReactNode } from 'react';
import type { User } from '../types';

interface Props {
  user: User;
  children: ReactNode;
}

export default function Layout({ user, children }: Props) {
  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-lavender-50">
      <header className="bg-white border-b border-lavender-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold text-stone-800">
              Lorraine's <span className="text-lavender-600">90th Birthday</span>
            </h1>
          </div>
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
      </header>

      <div className="relative h-44 sm:h-56 overflow-hidden">
        <img
          src="/bike.webp"
          alt="Lavender fields at sunset"
          className="w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-lavender-950/10 to-lavender-950/50" />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
