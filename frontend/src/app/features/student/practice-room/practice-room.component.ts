import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService, Session } from '../../../core/services/session.service';
import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-practice-room',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent],
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
