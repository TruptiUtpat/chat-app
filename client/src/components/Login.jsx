import { useState } from 'react';

const ROOMS = ['general', 'tech', 'random', 'jobs'];

export default function Login({ onJoin }) {
  const [username, setUsername] = useState('');
  const [room, setRoom]         = useState('general');
  const [error, setError]       = useState('');

  const handleJoin = () => {
    if (!username.trim()) { setError('Please enter a username'); return; }
    onJoin(username.trim(), room);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
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

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">

          {/* Username */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">Your username</label>
            <input
              type="text"
              placeholder="e.g. Trupti"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700
                         rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500
                         focus:ring-1 focus:ring-teal-500 transition"
            />
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>

          {/* Room picker */}
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

          <button onClick={handleJoin}
            className="w-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-white
                       font-semibold py-3 rounded-xl transition text-sm">
            Join Room →
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-5">
          Open two browser tabs and chat between them in real time
        </p>
      </div>
    </div>
  );
}