
import { io } from 'socket.io-client';
import { SOCKET_URL } from './api';

const socket = io(SOCKET_URL, { transports: ['websocket'] });
export default socket;