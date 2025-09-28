import { io, Socket } from 'socket.io-client';

let s: Socket | undefined;

export function getSocket(url: string) {
  if (!s) s = io(url, { transports: ['websocket'], withCredentials: true });
  return s;
}