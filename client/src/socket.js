import { io } from 'socket.io-client';

const token = localStorage.getItem('token'); // 🆕 read token

const socket = io("https://chat-app-production-64cd.up.railway.app", {
  transports: ['websocket', 'polling'],
  auth: { token } // 🆕 pass token on connect
});

export default socket;