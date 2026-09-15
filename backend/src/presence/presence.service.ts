import { Injectable } from "@nestjs/common";

@Injectable()
export class PresenceService {
    private onlineUsers = new Map<string, Set<string>>();

    addConnection(userId: string, socketId: string) {
        if (!this.onlineUsers.has(userId)) {
            this.onlineUsers.set(userId, new Set());
        }
        this.onlineUsers.get(userId)!.add(socketId);
    }

    removeConnection(userId: string, socketId: string): boolean {
        const sockets = this.onlineUsers.get(userId);
        if (!sockets) return false;

        sockets.delete(socketId);
        if (sockets.size === 0) {
            this.onlineUsers.delete(userId);
            return false;
        }
        return true;
    }

    isOnline(userId: string): boolean {
        return this.onlineUsers.has(userId);
    }

    getOnlineUserIds(): string[] {
        return Array.from(this.onlineUsers.keys());
    }
}
