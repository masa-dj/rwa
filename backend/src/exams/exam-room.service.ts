import { Injectable } from "@nestjs/common";

interface RoomState {
    studentReady: boolean;
    supervisorReady: boolean;
}

@Injectable()
export class ExamRoomService {
    private rooms = new Map<string, RoomState>();

    private getOrCreate(examId: string): RoomState {
        if (!this.rooms.has(examId)) {
            this.rooms.set(examId, {
                studentReady: false,
                supervisorReady: false,
            });
        }
        return this.rooms.get(examId)!;
    }

    setReady(examId: string, role: "student" | "supervisor"): RoomState {
        const room = this.getOrCreate(examId);
        if (role === "student") room.studentReady = true;
        else room.supervisorReady = true;
        return room;
    }

    bothReady(examId: string): boolean {
        const room = this.rooms.get(examId);
        return !!room && room.studentReady && room.supervisorReady;
    }

    getState(examId: string): RoomState {
        return this.getOrCreate(examId);
    }

    clear(examId: string) {
        this.rooms.delete(examId);
    }
}
