import { useEffect, useState, useRef } from 'react';
import socket from '../socket';

export default function Chat({ username, room }) {
  const [messages, setMessages]     = useState([]);
  const [users, setUsers]           = useState([]);
  const [text, setText]             = useState('');
  const [typing, setTyping]         = useState('');
  const [connected, setConnected]   = useState(true);
  const [sidebarOpen, setSidebar]   = useState(true);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);
  const inputRef    = useRef(null);

  useEffect(() => {
    socket.emit('join_room', { username, room });

    socket.on('message_history',  msgs => setMessages(msgs));
    socket.on('receive_message',  msg  => setMessages(p => [...p, msg]));
    socket.on('room_users',       list => setUsers(list));
    socket.on('user_typing',      name => setTyping(`${name} is typing`));
    socket.on('user_stop_typing', ()   => setTyping(''));
    socket.on('disconnect',       ()   => setConnected(false));
    socket.on('connect',          ()   => setConnected(true));

    return () => {
      ['message_history','receive_message','room_users',
       'user_typing','user_stop_typing','disconnect','connect']
        .forEach(e => socket.off(e));
    };
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit('send_message', { room, username, text });
    socket.emit('stop_typing', { room });
    clearTimeout(typingTimer.current);
    setText('');
    inputRef.current?.focus();
  };

  const handleTyping = e => {
    setText(e.target.value);
    socket.emit('typing', { room, username });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(
      () => socket.emit('stop_typing', { room }), 1500
    );
  };

  const fmt = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isSystem = m => m.username === 'System';
  const isMine   = m => m.username === username;

  return (
    <div className="h-screen bg-gray-950 flex overflow-hidden">

      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-60' : 'w-0'} transition-all duration-300 overflow-hidden
                       bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0`}>

        {/* Brand */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">ChatApp</p>
              <p className="text-gray-500 text-xs mt-0.5"># {room}</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-teal-400' : 'bg-red-400'}`}/>
              <span className={`text-xs ${connected ? 'text-teal-400' : 'text-red-400'}`}>
                {connected ? 'live' : 'off'}
              </span>
            </div>
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Online — {users.length}
          </p>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-2.5">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center
                                  text-sm font-semibold text-white">
                    {u.username[0].toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-teal-400
                                   rounded-full border-2 border-gray-900"/>
                </div>
                <span className={`text-sm truncate
                  ${u.username === username ? 'text-teal-400 font-medium' : 'text-gray-300'}`}>
                  {u.username}{u.username === username ? ' (you)' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current user footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center
                            text-sm font-bold text-white flex-shrink-0">
              {username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{username}</p>
              <p className="text-gray-500 text-xs"># {room}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800 bg-gray-900 flex items-center gap-3">
          <button onClick={() => setSidebar(p => !p)}
            className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div>
            <h2 className="text-white font-semibold text-sm"># {room}</h2>
            <p className="text-gray-500 text-xs">{users.length} online</p>
          </div>
          {!connected && (
            <div className="ml-auto flex items-center gap-1.5 bg-red-500/10 border border-red-500/20
                            text-red-400 text-xs px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"/>
              Reconnecting...
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <p className="text-gray-400 font-medium text-sm">No messages yet</p>
              <p className="text-gray-600 text-xs mt-1">Be first to say something in #{room}</p>
            </div>
          )}

          <div className="space-y-0.5">
            {messages.map((msg, i) => {
              if (isSystem(msg)) return (
                <div key={i} className="flex justify-center py-2">
                  <span className="text-xs text-gray-600 bg-gray-800/60 px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );

              const mine       = isMine(msg);
              const prev       = messages[i - 1];
              const grouped    = prev && !isSystem(prev) && prev.username === msg.username;

              return (
                <div key={i}
                  className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''} ${grouped ? 'mt-0.5' : 'mt-4'}`}>

                  {/* Avatar */}
                  {!grouped
                    ? <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center
                                       justify-content-center items-center text-sm font-bold text-white
                                       ${mine ? 'bg-teal-600' : 'bg-gray-700'}`}>
                        <span className="w-full text-center">{msg.username[0].toUpperCase()}</span>
                      </div>
                    : <div className="w-8 flex-shrink-0"/>
                  }

                  <div className={`flex flex-col max-w-xs lg:max-w-sm xl:max-w-md
                                   ${mine ? 'items-end' : 'items-start'}`}>
                    {!grouped && (
                      <div className={`flex items-baseline gap-2 mb-1
                                       ${mine ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-semibold text-white">{msg.username}</span>
                        <span className="text-xs text-gray-600">{fmt(msg.timestamp)}</span>
                      </div>
                    )}
                    <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed
                      ${mine
                        ? 'bg-teal-600 text-white rounded-tr-sm'
                        : 'bg-gray-800 text-gray-100 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Typing indicator */}
          {typing && (
            <div className="flex items-center gap-2 mt-3 ml-11">
              <div className="flex gap-1 px-3 py-2 bg-gray-800 rounded-2xl rounded-tl-sm w-fit">
                {[0,150,300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}/>
                ))}
              </div>
              <span className="text-xs text-gray-500">{typing}</span>
            </div>
          )}

          <div ref={bottomRef}/>
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex gap-2 items-center">
            <div className="flex-1 flex items-center bg-gray-800 border border-gray-700
                            rounded-2xl px-4 focus-within:border-teal-500 transition">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={`Message #${room}...`}
                className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm
                           py-3 focus:outline-none"
              />
            </div>
            <button onClick={sendMessage} disabled={!text.trim()}
              className="w-11 h-11 bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700
                         disabled:cursor-not-allowed text-white rounded-xl flex items-center
                         justify-center transition active:scale-95 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
          <p className="text-gray-700 text-xs mt-2 text-center">Enter to send</p>
        </div>
      </div>
    </div>
  );
}