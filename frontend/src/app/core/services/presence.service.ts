
import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

export interface PresenceUser {
  id: string;
  name: string;
  status: 'active' | 'offline';
  lastSeenAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class PresenceService implements OnDestroy {
  private socket: Socket | null = null;

  private presenceListSubject = new BehaviorSubject<PresenceUser[]>([]);
  presenceList$ = this.presenceListSubject.asObservable();

  connect(token: string) {
    console.log('[PresenceService] connect() called with token:', token ? 'present' : 'MISSING');

    if (this.socket) {
      console.log('[PresenceService] already connected, skipping');
      return;
    }

    this.socket = io(APP_CONFIG.socketUrl, {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('[PresenceService] socket connected, id:', this.socket?.id);
    });

    this.socket.on('presence:list', (users: PresenceUser[]) => {
      console.log('[PresenceService] received presence:list', users);
      this.presenceListSubject.next(users);
    });

    this.socket.on('connect_error', (err: Error) => {
      console.error('[PresenceService] connect_error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[PresenceService] disconnected:', reason);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.presenceListSubject.next([]);
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
