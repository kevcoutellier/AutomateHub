import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId: string;
}

declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}
