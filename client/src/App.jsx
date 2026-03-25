import { useState } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';

export default function App() {
  const [user, setUser] = useState(null);
  return user
    ? <Chat username={user.username} room={user.room} />
    : <Login onJoin={(username, room) => setUser({ username, room })} />;
}