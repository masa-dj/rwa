import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { PresenceUser } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class PresenceService implements OnDestroy {
    private socket: Socket | null = null;

    private presenceListSubject = new BehaviorSubject<PresenceUser[]>([]);
    presenceList$ = this.presenceListSubject.asObservable();

    connect(token: string) {
        if (this.socket) {
            return;
        }

        this.socket = io(APP_CONFIG.socketUrl, {
            auth: { token },
        });

        this.socket.on('connect', () => {});

        this.socket.on('presence:list', (users: PresenceUser[]) => {
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
