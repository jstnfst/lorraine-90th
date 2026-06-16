import { useEffect, useState } from 'react';
import type { User, Question, Rsvp } from '../types';

const ANSWER_MAX = 1000;

interface Props {
  user: User;
}

interface UserRecord {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  banned: boolean;
  created_at: string;
}

export default function AdminView({ user }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answeringId, setAnsweringId] = useState<number | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [confirmAdminId, setConfirmAdminId] = useState<string | null>(null);
  const [confirmBanId, setConfirmBanId] = useState<string | null>(null);
  const [banningId, setBanningId] = useState<string | null>(null);

  const [rsvps, setRsvps] = useState<(Rsvp & { name: string; email: string })[]>([]);
  const [rsvpsLoading, setRsvpsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/questions')
      .then(r => r.json())
      .then((data: Question[]) => setQuestions(data))
      .finally(() => setQuestionsLoading(false));

    fetch('/api/admin/users')
      .then(r => r.json())
      .then((data: UserRecord[]) => setUsers(data))
      .finally(() => setUsersLoading(false));

    fetch('/api/admin/rsvps')
      .then(r => r.json())
      .then((data: (Rsvp & { name: string; email: string })[]) => setRsvps(data))
      .finally(() => setRsvpsLoading(false));
  }, []);

  async function submitAnswer(questionId: number) {
    const answer = answers[questionId];
    if (!answer?.trim()) return;
    setAnsweringId(questionId);
    const r = await fetch(`/api/admin/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: answer.trim() }),
    });
    if (r.ok) {
      const updated: Question = await r.json();
      setQuestions(prev => prev.map(q => (q.id === questionId ? updated : q)));
      setAnswers(prev => { const n = { ...prev }; delete n[questionId]; return n; });
    }
    setAnsweringId(null);
  }

  async function makeAdmin(userId: string) {
    setPromotingId(userId);
    const r = await fetch(`/api/admin/users/${userId}/make-admin`, { method: 'POST' });
    if (r.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: true } : u));
    }
    setPromotingId(null);
  }

  async function banUser(userId: string) {
    setBanningId(userId);
    const r = await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST' });
    if (r.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: true } : u));
    setBanningId(null);
    setConfirmBanId(null);
  }

  async function unbanUser(userId: string) {
    setBanningId(userId);
    const r = await fetch(`/api/admin/users/${userId}/unban`, { method: 'POST' });
    if (r.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: false } : u));
    setBanningId(null);
  }

  async function confirmRsvp(rsvpId: number) {
    setConfirmingId(rsvpId);
    const r = await fetch(`/api/admin/rsvps/${rsvpId}/confirm`, { method: 'POST' });
    if (r.ok) {
      setRsvps(prev => prev.map(r => r.id === rsvpId ? { ...r, confirmed: true } : r));
    }
    setConfirmingId(null);
  }

  const unanswered = questions.filter(q => !q.answer);
  const answered = questions.filter(q => q.answer);

  return (
    <div className="space-y-8">
      <div className="text-center py-4">
        <p className="font-serif text-lg text-stone-500 italic">Admin Dashboard</p>
        <h2 className="font-serif text-3xl font-bold text-stone-800">Lorraine's 90th Birthday</h2>
      </div>

      {/* RSVPs */}
      <Card title={`RSVPs (${rsvps.length})`}>
        {rsvpsLoading ? (
          <p className="text-stone-400 text-sm">Loading...</p>
        ) : rsvps.length === 0 ? (
          <p className="text-stone-400 text-sm italic">No RSVPs yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left py-2 pr-4 text-stone-400 font-medium">Guest</th>
                <th className="text-left py-2 pr-4 text-stone-400 font-medium">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rsvps.map(r => (
                <tr key={r.id}>
                  <td className="py-2 pr-4">
                    <p className="text-stone-700 font-medium">{r.name}</p>
                    <p className="text-stone-400 text-xs">{r.email}</p>
                  </td>
                  <td className="py-2 pr-4">
                    {r.confirmed ? (
                      <span className="text-green-600 font-semibold">Confirmed</span>
                    ) : (
                      <span className="text-amber-500">Pending</span>
                    )}
                  </td>
                  <td className="py-2">
                    {!r.confirmed && (
                      <button
                        onClick={() => confirmRsvp(r.id)}
                        disabled={confirmingId === r.id}
                        className="text-xs bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-white px-3 py-1 rounded-full transition-colors"
                      >
                        {confirmingId === r.id ? 'Confirming...' : 'Confirm'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>

      {/* Unanswered Questions */}
      <Card title={`Messages Awaiting Reply (${unanswered.length})`}>
        {questionsLoading ? (
          <p className="text-stone-400 text-sm">Loading...</p>
        ) : unanswered.length === 0 ? (
          <p className="text-stone-400 text-sm italic">All messages have been answered.</p>
        ) : (
          <div className="space-y-5">
            {unanswered.map(q => (
              <div key={q.id} className="border border-gold-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-stone-700">{q.question}</p>
                </div>
                <p className="text-xs text-stone-400 mb-3">
                  From {q.user_name} · {new Date(q.created_at).toLocaleDateString()}
                </p>
                <textarea
                  value={answers[q.id] ?? ''}
                  onChange={e =>
                    setAnswers(prev => ({ ...prev, [q.id]: e.target.value.slice(0, ANSWER_MAX) }))
                  }
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none text-sm mb-2"
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${(answers[q.id]?.length ?? 0) >= ANSWER_MAX ? 'text-red-500' : 'text-stone-300'}`}>
                    {answers[q.id]?.length ?? 0}/{ANSWER_MAX}
                  </span>
                  <button
                    onClick={() => submitAnswer(q.id)}
                    disabled={answeringId === q.id || !answers[q.id]?.trim()}
                    className="text-sm bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    {answeringId === q.id ? 'Sending...' : 'Reply'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Answered */}
      {answered.length > 0 && (
        <Card title={`Answered (${answered.length})`}>
          <div className="space-y-4">
            {answered.map(q => (
              <div key={q.id} className="border-l-2 border-gold-200 pl-4">
                <p className="text-stone-700 text-sm">{q.question}</p>
                <p className="text-xs text-stone-400 mb-2">From {q.user_name}</p>
                <div className="bg-gold-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gold-700 font-semibold mb-1">Your reply</p>
                  <p className="text-stone-600 text-sm">{q.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* User Management */}
      <Card title="Guest List / Admins">
        {usersLoading ? (
          <p className="text-stone-400 text-sm">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left py-2 pr-4 text-stone-400 font-medium">Guest</th>
                <th className="text-left py-2 pr-4 text-stone-400 font-medium">Role</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {users.filter(u => !u.banned).map(u => (
                <tr key={u.id}>
                  <td className="py-2 pr-4">
                    <p className="text-stone-700">{u.name}</p>
                    <p className="text-stone-400 text-xs">{u.email}</p>
                  </td>
                  <td className="py-2 pr-4">
                    {u.is_admin ? (
                      <span className="bg-gold-100 text-gold-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">Guest</span>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      {!u.is_admin && u.id !== user.id && (
                        confirmAdminId === u.id ? (
                          <span className="inline-flex items-center gap-2">
                            <button
                              onClick={() => { makeAdmin(u.id); setConfirmAdminId(null); }}
                              disabled={promotingId === u.id}
                              className="text-xs bg-lavender-600 hover:bg-lavender-700 disabled:opacity-50 text-white font-semibold px-3 py-1 rounded-full transition-colors"
                            >
                              {promotingId === u.id ? 'Promoting...' : 'Yes, promote'}
                            </button>
                            <button onClick={() => setConfirmAdminId(null)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmAdminId(u.id)} className="text-xs text-gold-600 hover:text-gold-800 font-medium transition-colors">
                            Make admin
                          </button>
                        )
                      )}
                      {u.id !== user.id && (
                        confirmBanId === u.id ? (
                          <span className="inline-flex items-center gap-2">
                            <button
                              onClick={() => banUser(u.id)}
                              disabled={banningId === u.id}
                              className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-3 py-1 rounded-full transition-colors"
                            >
                              {banningId === u.id ? 'Banning...' : 'Yes, ban'}
                            </button>
                            <button onClick={() => setConfirmBanId(null)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmBanId(u.id)} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                            Ban
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Banned Users */}
      {!usersLoading && users.some(u => u.banned) && (
        <Card title="Banned Users">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left py-2 pr-4 text-stone-400 font-medium">Guest</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {users.filter(u => u.banned).map(u => (
                <tr key={u.id}>
                  <td className="py-2 pr-4">
                    <p className="text-stone-400 line-through">{u.name}</p>
                    <p className="text-stone-300 text-xs">{u.email}</p>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => unbanUser(u.id)}
                      disabled={banningId === u.id}
                      className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50 font-medium transition-colors"
                    >
                      {banningId === u.id ? 'Unbanning...' : 'Unban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gold-100 p-6">
      <h3 className="font-serif text-xl font-semibold text-stone-700 mb-4 pb-2 border-b border-gold-100">
        {title}
      </h3>
      {children}
    </div>
  );
}
