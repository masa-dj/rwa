import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService, Session } from '../../../core/services/session.service';
import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { VesselCauterizationComponent, CauterizationResult } from '../../exercises/vessel-cauterization/vessel-cauterization.component';

@Component({
  selector: 'app-practice-room',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent, VesselCauterizationComponent],
  templateUrl: './practice-room.component.html',
  styleUrls: ['./practice-room.component.scss'],
})
export class PracticeRoomComponent implements OnInit {
  session: Session | null = null;
  loading = true;
  ended = false;
  endedMessage = '';

  exerciseLabels: Record<string, string> = {
    steady_path: 'Steady Path',
    timed_suture: 'Timed Suture',
    vessel_cauterization: 'Vessel Cauterization',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.sessionService.getMine().subscribe((sessions) => {
      this.session = sessions.find((s) => s.id === id) ?? null;
      this.loading = false;
    });
  }

  get isVesselCauterization(): boolean {
    return this.session?.exerciseType === 'vessel_cauterization';
  }

  onExerciseFinished(result: CauterizationResult) {
    if (!this.session) return;

    const score = Math.round((result.sealed / (result.sealed + result.missed || 1)) * 100);

    this.sessionService.complete(this.session.id, {
      precisionScore: score,
      tremorIndex: 0, //the supervisor influence for later
      score,
    }).subscribe(() => {
      this.ended = true;
      this.endedMessage = `Sealed ${result.sealed}, missed ${result.missed}. Score: ${score}.`;
    });
  }

  finish() {
    if (!this.session) return;
    this.sessionService.complete(this.session.id).subscribe(() => {
      this.ended = true;
      this.endedMessage = 'Practice session finished.';
    });
  }

  abort() {
    if (!this.session) return;
    this.sessionService.abort(this.session.id).subscribe(() => {
      this.ended = true;
      this.endedMessage = 'Practice session aborted.';
    });
  }

  backToPractice() {
    this.router.navigate(['/practice']);
  }
}
