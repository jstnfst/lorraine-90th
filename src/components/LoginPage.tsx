export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ backgroundImage: 'url(/bike.webp)', backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
    >
      <div className="absolute inset-0 bg-lavender-950/65" />
      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-lavender-200 p-10 max-w-md w-full text-center">
        <p className="font-serif text-lavender-500 text-sm uppercase tracking-widest mb-2">
          You're invited
        </p>
        <h1 className="font-serif text-4xl font-bold text-stone-800 leading-tight mb-2">
          Lorraine's
        </h1>
        <h2 className="font-serif text-5xl font-bold text-lavender-600 leading-tight mb-6">
          90<span className="text-stone-800">th Birthday</span>
        </h2>
        <p className="text-stone-500 mb-8">
          Sign in to RSVP and leave a message for Lorraine.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/api/auth/google"
            className="inline-flex items-center justify-center gap-3 bg-white border-2 border-lavender-400 text-stone-700 font-semibold px-6 py-3 rounded-full hover:bg-lavender-50 hover:border-lavender-500 transition-colors shadow-sm"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
          <a
            href="/api/auth/microsoft"
            className="inline-flex items-center justify-center gap-3 bg-[#0078D4] hover:bg-[#106EBE] text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-sm"
          >
            <MicrosoftIcon />
            Sign in with Microsoft
          </a>
          <a
            href="/api/auth/yahoo"
            className="inline-flex items-center justify-center gap-3 bg-[#6001D2] hover:bg-[#4B01A8] text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-sm"
          >
            <YahooIcon />
            Sign in with Yahoo
          </a>
        </div>
      </div>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  );
}

function YahooIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="white">
      <path d="M0 3h6.6l5.4 8.3L17.4 3H24l-9 13.7V24h-6v-7.3z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-7.9 19.6-20 0-1.3-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.5l-6.5 5C9.8 39.7 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.5 5.8l6.2 5.2C40.9 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  );
}
