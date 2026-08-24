import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ExamRoomService } from './exam-room.service';
import { ExamService } from './exam.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ExamGateway {
    @WebSocketServer()
    server!: Server;

    constructor(
        private jwtService: JwtService,
        private examRoomService: ExamRoomService,
        private examService: ExamService,
    ) {}

    private authenticate(client: Socket) {
        const token =
            (client.handshake.auth?.token as string) ||
            client.handshake.headers.authorization?.split(' ')[1];
        if (!token) throw new Error('No token');
        return this.jwtService.verify(token);
    }

    @SubscribeMessage('exam:join-room')
    async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { examId: string }) {
        try {
            const payload = this.authenticate(client);
            const exam = await this.examService.findById(data.examId);

            const isStudent = exam.studentId === payload.sub;
            const isSupervisor = exam.supervisorId === payload.sub;
            if (!isStudent && !isSupervisor) {
                client.emit('exam:error', { message: 'Not authorized for this exam' });
            return;
            }
            client.data.userId = payload.sub;
            client.data.role = isStudent ? 'student' : 'supervisor';
            client.data.examId = data.examId;
            client.join(`exam:${data.examId}`);

            const state = this.examRoomService.getState(data.examId);
            this.server.to(`exam:${data.examId}`).emit('exam:room-state', state);
        } catch {
            client.emit('exam:error', { message: 'Authentication failed' });
            client.disconnect();
        }
    }

    @SubscribeMessage('exam:ready')
    async handleReady(@ConnectedSocket() client: Socket) {
        const { examId, role } = client.data;
        if (!examId || !role) return;

        const state = this.examRoomService.setReady(examId, role);
        this.server.to(`exam:${examId}`).emit('exam:room-state', state);

        if (this.examRoomService.bothReady(examId)) {
            try {
                const exam = await this.examService.findById(examId);
                const started = await this.examService.start(examId, exam.studentId);
                this.server.to(`exam:${examId}`).emit('exam:started', started);
            } catch (err: any) {
                this.server.to(`exam:${examId}`).emit('exam:error', { message: err.message });
            }
        }
    }

    @SubscribeMessage('exam:abort')
    async handleAbort(@ConnectedSocket() client: Socket) {
        const { examId, role } = client.data;
        if (role !== 'supervisor') return;

        try {
            const exam = await this.examService.abort(examId);
            this.examRoomService.clear(examId);
            this.server.to(`exam:${examId}`).emit('exam:aborted', exam);
        } catch (err: any) {
            client.emit('exam:error', { message: err.message });
        }
    }

    @SubscribeMessage('exam:finish')
    async handleFinish(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { precisionScore: number; tremorIndex: number; score: number },
    ) {
        const { examId, role } = client.data;
        if (role !== 'student') return;
        try {
            const exam = await this.examService.complete(examId, data);
            this.examRoomService.clear(examId);
            this.server.to(`exam:${examId}`).emit('exam:finished', exam);
        } catch (err: any) {
            client.emit('exam:error', { message: err.message });
        }
    }

    @SubscribeMessage('exam:telemetry')
    handleTelemetry(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        const { examId, role } = client.data;
        if (role !== 'student' || !examId) {
            return;
        }
        client.to(`exam:${examId}`).emit('exam:telemetry', data);
    }
}