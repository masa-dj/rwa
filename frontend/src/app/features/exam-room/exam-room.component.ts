import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';

type RoomStatus = 'connecting' | 'waiting' | 'in_progress' | 'ended' | 'error';

@Component({
  selector: 'app-exam-room',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent],
  templateUrl: './exam-room.component.html',
  styleUrls: ['./exam-room.component.scss'],
})
export class ExamRoomComponent implements OnInit, OnDestroy {
  examId!: string;
  isSupervisor = false;
  status: RoomStatus = 'connecting';
  studentReady = false;
  supervisorReady = false;
  myReady = false;
  errorMessage = '';
  endedMessage = '';

  private socket: Socket | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.examId = this.route.snapshot.paramMap.get('id')!;
    this.isSupervisor = this.authService.getUser()?.role === 'supervisor';

    this.socket = io('http://localhost:3000', { auth: { token: this.authService.getToken() } });

    this.socket.on('connect', () => {
      this.socket!.emit('exam:join-room', { examId: this.examId });
    });

    this.socket.on('exam:room-state', (state: { studentReady: boolean; supervisorReady: boolean }) => {
      this.studentReady = state.studentReady;
      this.supervisorReady = state.supervisorReady;
      this.myReady = this.isSupervisor ? state.supervisorReady : state.studentReady;
      if (this.status === 'connecting') this.status = 'waiting';
    });

    this.socket.on('exam:started', () => (this.status = 'in_progress'));

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

  markReady() { this.socket?.emit('exam:ready'); }
  abort() { this.socket?.emit('exam:abort'); }
  finish() { this.socket?.emit('exam:finish'); }
  backToExams() { this.router.navigate(['/exams']); }

  ngOnDestroy() {
    this.socket?.disconnect();
  }
}
