import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../core/services/auth.service';
import { ExamService, Exam } from '../../core/services/exam.service';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { VesselCauterizationComponent, CauterizationResult, TelemetrySnapshot } from '../exercises/vessel-cauterization/vessel-cauterization.component';
import { ExamLiveViewComponent } from '../exercises/exam-live-view/exam-live-view.component';

type RoomStatus = 'connecting' | 'waiting' | 'in_progress' | 'ended' | 'error';

@Component({
  selector: 'app-exam-room',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent, VesselCauterizationComponent, ExamLiveViewComponent],
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
  latestTelemetry: TelemetrySnapshot | null = null;

  private socket: Socket | null = null;

  exerciseInfo: Record<string, { equipment: string; time: string; description: string }> = {
    vessel_cauterization: {
      equipment: 'Mouse',
      time: '1 minute',
      description:
        'Circular vessels will appear and drift across the canvas. Hold the mouse button down over a vessel and keep it centered for 3 seconds to seal it. Losing contact resets your progress on that vessel.',
    },
    steady_path: {
      equipment: 'Mouse',
      time: '',
      description: '',
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
    private examService: ExamService,
  ) {}

  ngOnInit() {
    this.examId = this.route.snapshot.paramMap.get('id')!;
    this.isSupervisor = this.authService.getUser()?.role === 'supervisor';

    this.examService.getOne(this.examId).subscribe((exam) => {
      this.exam = exam;
      if (exam.status === 'in_progress') this.status = 'in_progress'; // rejoin mid-exam
    });

    this.socket = io('http://localhost:3000', { auth: { token: this.authService.getToken() } });

    this.socket.on('connect', () => this.socket!.emit('exam:join-room', { examId: this.examId }));

    this.socket.on('exam:room-state', (state: { studentReady: boolean; supervisorReady: boolean }) => {
      this.studentReady = state.studentReady;
      this.supervisorReady = state.supervisorReady;
      this.myReady = this.isSupervisor ? state.supervisorReady : state.studentReady;
      if (this.status === 'connecting') this.status = 'waiting';
    });

    this.socket.on('exam:started', (exam: Exam) => {
      this.exam = exam;
      this.status = 'in_progress';
    });

    this.socket.on('exam:telemetry', (snapshot: TelemetrySnapshot) => {
      console.log('[supervisor] telemetry received', snapshot);
      this.latestTelemetry = snapshot;
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
  }

  get isVesselCauterization(): boolean {
    return this.exam?.exerciseType === 'vessel_cauterization';
  }

  markReady() { this.socket?.emit('exam:ready'); }
  abort() { this.socket?.emit('exam:abort'); }

  onTelemetry(snapshot: TelemetrySnapshot) {
    console.log('[student] sending telemetry', snapshot);
    this.socket?.emit('exam:telemetry', snapshot);
  }

  onExerciseFinished(result: CauterizationResult) {
    const score = Math.round((result.sealed / (result.sealed + result.missed || 1)) * 100);
    this.socket?.emit('exam:finish', { precisionScore: score, tremorIndex: 0, score });
  }

  get currentExerciseInfo() {
    return this.exam ? this.exerciseInfo[this.exam.exerciseType] : null;
  }

  backToExams() { this.router.navigate(['/exams']); }

  ngOnDestroy() {
    this.socket?.disconnect();
  }
}
