import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../core/services/auth.service';
import { ExamService, Exam } from '../../core/services/exam.service';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import {
    VesselCauterizationComponent,
    CauterizationResult,
    TelemetrySnapshot,
} from '../exercises/vessel-cauterization/vessel-cauterization.component';
import { VesselCauterizationLiveViewComponent } from '../exercises/vessel-cauterization-live-view/vessel-cauterization-live-view.component';
import {
    SteadyPathComponent,
    SteadyPathResult,
    SteadyPathTelemetrySnapshot,
} from '../exercises/steady-path/steady-path.component';
import { SteadyPathLiveViewComponent } from '../exercises/steady-path-live-view/steady-path-live-view.component';
import {
    TimedSutureComponent,
    TimedSutureResult,
    TimedSutureTelemetrySnapshot,
} from '../exercises/timed-suture/timed-suture.component';
import { TimedSutureLiveViewComponent } from '../exercises/timed-suture-live-view/timed-suture-live-view.component';
import { filter, fromEvent } from 'rxjs';

type RoomStatus = 'connecting' | 'waiting' | 'in_progress' | 'ended' | 'error';

@Component({
    selector: 'app-exam-room',
    standalone: true,
    imports: [
        CommonModule,
        SidebarComponent,
        ButtonComponent,
        VesselCauterizationComponent,
        VesselCauterizationLiveViewComponent,
        SteadyPathComponent,
        SteadyPathLiveViewComponent,
        TimedSutureComponent,
        TimedSutureLiveViewComponent,
    ],
    templateUrl: './exam-room.component.html',
    styleUrls: ['./exam-room.component.scss'],
})
export class ExamRoomComponent implements OnInit, OnDestroy {
    examId!: string;
    exam: Exam | null = null;
    isSupervisor = false;
    status: RoomStatus = 'connecting';
    studentReady = false;
    supervisorReady = false;
    myReady = false;
    errorMessage = '';
    endedMessage = '';
    latestVCTelemetry: TelemetrySnapshot | null = null;
    latestSteadyPathTelemetry: SteadyPathTelemetrySnapshot | null = null;
    latestTimedSutureTelemetry: TimedSutureTelemetrySnapshot | null = null;
    isFrozen = false;
    isShaking = false;
    tremorUsesLeft = 1;
    freezeUsesLeft = 1;

    private socket: Socket | null = null;

    exerciseInfo: Record<
        string,
        { equipment: string; time: string; description: string }
    > = {
        vessel_cauterization: {
            equipment: 'Mouse',
            time: '1 minute',
            description:
                'Circular vessels will appear and drift across the canvas. Hold the mouse button down over a vessel and keep it centered for 3 seconds to seal it. Losing contact resets your progress on that vessel.',
        },
        steady_path: {
            equipment: 'Mouse',
            time: '20 seconds',
            description:
                'A winding vessel will appear on the canvas. Click and drag from the start, staying inside the corridor as you trace toward the end. Drifting outside the tolerance hurts your precision score.',
        },
        timed_suture: {
            equipment: 'Mouse',
            time: '',
            description: '',
        },
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private examService: ExamService
    ) {}

    ngOnInit() {
        this.examId = this.route.snapshot.paramMap.get('id')!;
        this.isSupervisor = this.authService.getUser()?.role === 'supervisor';
        this.setupFreezeAcknowledge();
        this.examService.getOne(this.examId).subscribe((exam) => {
            this.exam = exam;
            if (exam.status === 'in_progress') this.status = 'in_progress'; // rejoin mid-exam
        });

        this.socket = io('http://localhost:3000', {
            auth: { token: this.authService.getToken() },
        });

        this.socket.on('connect', () =>
            this.socket!.emit('exam:join-room', { examId: this.examId })
        );

        this.socket.on(
            'exam:room-state',
            (state: { studentReady: boolean; supervisorReady: boolean }) => {
                this.studentReady = state.studentReady;
                this.supervisorReady = state.supervisorReady;
                this.myReady = this.isSupervisor
                    ? state.supervisorReady
                    : state.studentReady;
                if (this.status === 'connecting') this.status = 'waiting';
            }
        );

        this.socket.on('exam:started', (exam: Exam) => {
            this.exam = exam;
            this.status = 'in_progress';
        });

        this.socket.on('exam:telemetry', (data: any) => {
            if (this.exam?.exerciseType === 'vessel_cauterization') {
                this.latestVCTelemetry = data;
            } else if (this.exam?.exerciseType === 'steady_path') {
                this.latestSteadyPathTelemetry = data;
            } else if (this.exam?.exerciseType === 'timed_suture') {
                this.latestTimedSutureTelemetry = data;
            }
        });

        this.socket.on('exam:aborted', () => {
            this.status = 'ended';
            this.endedMessage = 'Exam was aborted by the supervisor.';
        });

        this.socket.on('exam:finished', () => {
            this.status = 'ended';
            this.endedMessage = 'Exam finished.';
        });

        this.socket.on('exam:error', (err: { message: string }) => {
            this.status = 'error';
            this.errorMessage = err.message;
        });

        this.socket.on('exam:freeze', () => {
            this.isFrozen = true;
            this.freezeUsesLeft = 0;
        });

        this.socket.on('exam:unfreeze', () => {
            this.isFrozen = false;
        });

        this.socket.on('exam:tremor', () => {
            this.isShaking = true;
            this.tremorUsesLeft = 0;
            setTimeout(() => (this.isShaking = false), 2000);
        });

    }
    private setupFreezeAcknowledge() {
        fromEvent<KeyboardEvent>(window, 'keydown')
            .pipe(filter((e) => e.code === 'Space' && this.isFrozen))
            .subscribe(() => this.socket?.emit('exam:freeze-acknowledged'));
    }
    get isVesselCauterization(): boolean {
        return this.exam?.exerciseType === 'vessel_cauterization';
    }

    get isSteadyPath(): boolean {
        return this.exam?.exerciseType === 'steady_path';
    }

    get isTimedSuture(): boolean {
        return this.exam?.exerciseType === 'timed_suture';
    }

    onTimedSutureTelemetry(snapshot: TimedSutureTelemetrySnapshot) {
        this.socket?.emit('exam:telemetry', snapshot);
    }

    onTimedSutureFinished(result: TimedSutureResult) {
        this.socket?.emit('exam:finish', {
            precisionScore: result.precision,
            tremorIndex: 0,
            score: result.score,
            reactionTime: result.avgReactionTimeMs,
        });
    }
    onSteadyPathTelemetry(snapshot: SteadyPathTelemetrySnapshot) {
        this.socket?.emit('exam:telemetry', snapshot);
    }

    onSteadyPathFinished(result: SteadyPathResult) {
        const score = Math.round(
            result.precision * 0.6 + result.completion * 0.4
        );
        this.socket?.emit('exam:finish', {
            precisionScore: result.precision,
            tremorIndex: 0,
            score,
        });
    }

    markReady() {
        this.socket?.emit('exam:ready');
    }
    abort() {
        if (this.exam?.sessionId) {
            this.socket?.emit('exam:log-event', {
                sessionId: this.exam.sessionId,
                type: 'exam_aborted',
            });
        }
        this.socket?.emit('exam:abort');
    }

    onTelemetry(snapshot: TelemetrySnapshot) {
        console.log('[student] sending telemetry', snapshot);
        this.socket?.emit('exam:telemetry', snapshot);
    }

    onExerciseFinished(result: CauterizationResult) {
        const score = Math.round(
            (result.sealed / (result.sealed + result.missed || 1)) * 100
        );
        this.socket?.emit('exam:finish', {
            precisionScore: score,
            tremorIndex: 0,
            score,
        });
    }

    get currentExerciseInfo() {
        return this.exam ? this.exerciseInfo[this.exam.exerciseType] : null;
    }

    backToExams() {
        this.router.navigate(['/exams']);
    }

    ngOnDestroy() {
        this.socket?.disconnect();
    }
    onSurgicalEvent(event: {
        type: string;
        x?: number;
        y?: number;
        payload?: any;
    }) {
        if (!this.exam?.sessionId) return;
        this.socket?.emit('exam:log-event', {
            sessionId: this.exam.sessionId,
            ...event,
        });
    }

    triggerFreeze() {
        this.socket?.emit('exam:trigger-freeze');
    }

    triggerTremor() {
        this.socket?.emit('exam:trigger-tremor');
    }
    get canFreeze(): boolean {
        return this.isVesselCauterization || this.isSteadyPath;
    }

    get canTremor(): boolean {
        return this.isVesselCauterization || this.isTimedSuture;
    }
}
