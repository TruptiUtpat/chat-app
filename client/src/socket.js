import { io } from 'socket.io-client';

const socket = io("https://chat-app-production-64cd.up.railway.app", {
  transports: ['websocket', 'polling']
});

export default socket;