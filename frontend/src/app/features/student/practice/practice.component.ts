import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';
import { ExerciseType, Session } from '../../../core/models/app.models';
import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
    selector: 'app-practice',
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent, ButtonComponent],
    templateUrl: './practice.component.html',
    styleUrls: ['./practice.component.scss'],
})
export class PracticeComponent implements OnInit {
    sessions: Session[] = [];
    loading = true;
    selectedExercise: ExerciseType = 'steady_path';
    isScreenSupported = true;

    exerciseTypes: { value: ExerciseType; label: string }[] = [
        { value: 'steady_path', label: 'Steady Path' },
        { value: 'timed_suture', label: 'Timed Suture' },
        { value: 'vessel_cauterization', label: 'Vessel Cauterization' },
    ];

    constructor(
        private sessionService: SessionService,
        private router: Router
    ) {}

    ngOnInit() {
        this.checkScreenWidth();
        this.checkActiveThenLoad();
    }

    @HostListener('window:resize')
    checkScreenWidth() {
        this.isScreenSupported = window.innerWidth > 1100;
    }

    private checkActiveThenLoad() {
        this.sessionService.getActive().subscribe({
            next: (active) => {
                if (active) {
                    this.router.navigate(['/practice', active.id]);
                    return;
                }
                this.loadHistory();
            },
            error: () => this.loadHistory(),
        });
    }

    private loadHistory() {
        this.sessionService.getMine().subscribe({
            next: (sessions) => {
                this.sessions = sessions
                    .filter((s) => s.mode === 'practice')
                    .sort(
                        (a, b) =>
                            new Date(b.startTime).getTime() -
                            new Date(a.startTime).getTime()
                    );
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }

    start() {
        this.sessionService
            .start(this.selectedExercise)
            .subscribe((session) => {
                this.router.navigate(['/practice', session.id]);
            });
    }

    exerciseLabel(type: ExerciseType): string {
        return this.exerciseTypes.find((e) => e.value === type)?.label ?? type;
    }
}
