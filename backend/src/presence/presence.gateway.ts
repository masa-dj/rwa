import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PresenceService } from './presence.service';
import { UsersService } from '../users/user.service';
import { UserRole } from '../users/user.entity';

@WebSocketGateway({cors: { origin: '*' },})
    export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
        @WebSocketServer()
        server!: Server;

        constructor(
            private jwtService: JwtService,
            private presenceService: PresenceService,
            private usersService: UsersService,
        ) {}

        async handleConnection(client: Socket) {
            console.log('[Gateway] connection attempt:', client.id);
            try {
                const token =
                (client.handshake.auth?.token as string) ||
                client.handshake.headers.authorization?.split(' ')[1];

                if (!token) throw new Error('No token provided');

                const payload = this.jwtService.verify(token);
                client.data.userId = payload.sub;
                client.data.role = payload.role;

                this.presenceService.addConnection(payload.sub, client.id);

                if (payload.role === UserRole.SUPERVISOR) {
                    client.join('supervisors');
                }

                await this.broadcastPresence();
                console.log('[Gateway] authenticated user:', client.data.userId, client.data.role);
            } catch {
                console.error('[Gateway] auth failed:');
                client.disconnect();
            }
        }

        async handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (!userId) return;

        const stillOnline = this.presenceService.removeConnection(userId, client.id);

        if (!stillOnline) {
            await this.usersService.updateLastSeen(userId, new Date());
        }

        await this.broadcastPresence();
        }

        private async broadcastPresence() {
        const users = await this.usersService.findAllWithPresence(
            this.presenceService.getOnlineUserIds(),
        );
        this.server.to('supervisors').emit('presence:list', users);
        }
    }