import { useState } from 'react';

const ROOMS = ['general', 'tech', 'random', 'jobs'];
const BASE  = 'https://chat-app-production-64cd.up.railway.app';

export default function Login({ onJoin }) {
  const [tab, setTab]           = useState('login');     // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [room, setRoom]         = useState('general');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');

  const handleSubmit = async () => {
    if (!username.trim()) { setError('Please enter a username'); return; }
    if (!password.trim()) { setError('Please enter a password'); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res  = await fetch(`${BASE}/auth/${tab}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (tab === 'register') {
        // After register, auto switch to login
        setSuccess('Registered! Please log in.');
        setTab('login');
        setPassword('');
        setLoading(false);
        return;
      }

      // Login success
      localStorage.setItem('token',    data.token);
      localStorage.setItem('username', data.username);
      onJoin(data.username, room);

    } catch (e) {
      setError('Network error — is the server running?');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo — unchanged from your original */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">ChatApp</h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time messaging · Socket.io · Node.js · React</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">

          {/* 🆕 Tabs */}
          <div className="flex bg-gray-800 rounded-xl p-1 mb-5">
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize
                  ${tab === t
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-4 px-4 py-2.5 bg-teal-500/10 border border-teal-500/20
                            text-teal-400 text-sm rounded-xl">
              {success}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              placeholder="e.g. Trupti"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700
                         rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500
                         focus:ring-1 focus:ring-teal-500 transition"
            />
          </div>

          {/* 🆕 Password */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700
                         rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500
                         focus:ring-1 focus:ring-teal-500 transition"
            />
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>

          {/* Room picker — only show on login tab */}
          {tab === 'login' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Choose a room</label>
              <div className="grid grid-cols-2 gap-2">
                {ROOMS.map(r => (
                  <button key={r} onClick={() => setRoom(r)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium transition border
                      ${room === r
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-teal-600 hover:text-white'}`}>
                    # {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 active:scale-95 disabled:bg-gray-700
                       disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl
                       transition text-sm">
            {loading ? 'Please wait...' : tab === 'login' ? 'Join Room →' : 'Create Account →'}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-5">
          Open two browser tabs and chat between them in real time
        </p>
      </div>
    </div>
  );
}