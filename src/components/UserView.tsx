import { useEffect, useState } from 'react';
import type { User, Question, Rsvp } from '../types';

const QUESTION_MAX = 500;

interface Props {
  user: User;
}

export default function UserView({ user }: Props) {
  const [rsvp, setRsvp] = useState<Rsvp | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(true);
  const [rsvpName, setRsvpName] = useState(user.name);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/rsvp')
      .then(r => (r.ok ? r.json() : null))
      .then((data: Rsvp | null) => setRsvp(data))
      .finally(() => setRsvpLoading(false));

    fetch('/api/questions')
      .then(r => r.json())
      .then((data: Question[]) => setQuestions(data))
      .finally(() => setQuestionsLoading(false));
  }, []);

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    setRsvpSubmitting(true);
    const r = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: rsvpName, email: user.email }),
    });
    if (r.ok) {
      const data: Rsvp = await r.json();
      setRsvp(data);
    }
    setRsvpSubmitting(false);
  }

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQuestionSubmitting(true);
    const r = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newQuestion.trim() }),
    });
    if (r.ok) {
      const data: Question = await r.json();
      setQuestions(prev => [data, ...prev]);
      setNewQuestion('');
    }
    setQuestionSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-4">
        <p className="font-serif text-lg text-stone-500 italic">Welcome,</p>
        <h2 className="font-serif text-3xl font-bold text-stone-800">{user.name}</h2>
      </div>

      {/* Event Details */}
      <Card title="The Celebration">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <Detail label="Date" value="September 5, 2026" />
          <Detail label="Time" value="12:00 PM – 6:00 PM" />
          <Detail label="Location" value="TBD" />
        </div>
      </Card>

      {/* RSVP */}
      <Card title="RSVP">
        {rsvpLoading ? (
          <p className="text-stone-400 text-sm">Loading...</p>
        ) : rsvp ? (
          <div className="text-center py-2">
            <p className="text-2xl mb-1">
              {rsvp.confirmed ? '✓' : '⏳'}
            </p>
            <p className="font-semibold text-stone-700">
              {rsvp.confirmed
                ? "You're confirmed! We'll see you there."
                : "We received your RSVP and will confirm shortly."}
            </p>
            <p className="text-sm text-stone-400 mt-1">
              RSVP'd as {rsvp.name} · {rsvp.email}
            </p>
          </div>
        ) : (
          <form onSubmit={submitRsvp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Your name
              </label>
              <input
                type="text"
                value={rsvpName}
                onChange={e => setRsvpName(e.target.value)}
                required
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full border border-stone-100 rounded-lg px-3 py-2 text-stone-400 bg-stone-50"
              />
            </div>
            <button
              type="submit"
              disabled={rsvpSubmitting}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {rsvpSubmitting ? 'Submitting...' : 'RSVP Now'}
            </button>
          </form>
        )}
      </Card>

      {/* Questions */}
      <Card title="Leave a Message / Ask a Question">
        <form onSubmit={submitQuestion} className="space-y-3 mb-6">
          <div>
            <textarea
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value.slice(0, QUESTION_MAX))}
              placeholder="Write a message for Lorraine or ask the family something..."
              rows={4}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
            />
            <p className={`text-xs mt-1 text-right ${newQuestion.length >= QUESTION_MAX ? 'text-red-500' : 'text-stone-400'}`}>
              {newQuestion.length}/{QUESTION_MAX}
            </p>
          </div>
          <button
            type="submit"
            disabled={questionSubmitting || !newQuestion.trim()}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {questionSubmitting ? 'Sending...' : 'Send'}
          </button>
        </form>

        {questionsLoading ? (
          <p className="text-stone-400 text-sm">Loading...</p>
        ) : questions.length === 0 ? (
          <p className="text-stone-400 text-sm italic">No messages yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="border-l-2 border-gold-200 pl-4">
                <p className="text-stone-700">{q.question}</p>
                {q.answer && (
                  <div className="mt-2 bg-gold-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gold-700 font-semibold mb-1">Reply from the family</p>
                    <p className="text-stone-600 text-sm">{q.answer}</p>
                  </div>
                )}
                <p className="text-xs text-stone-300 mt-1">
                  {new Date(q.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-serif text-lg text-stone-700">{value}</p>
    </div>
  );
}
