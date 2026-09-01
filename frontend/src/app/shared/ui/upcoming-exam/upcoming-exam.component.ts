import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService, Exam } from '../../../core/services/exam.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-upcoming-exam',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './upcoming-exam.component.html',
    styleUrls: ['./upcoming-exam.component.scss'],
})
export class UpcomingExamComponent implements OnInit {
    isSupervisor = false;
    nextExam: Exam | null = null;
    loading = true;

    exerciseLabels: Record<string, string> = {
        steady_path: 'Steady Path',
        timed_suture: 'Timed Suture',
        vessel_cauterization: 'Vessel Cauterization',
    };

    constructor(
        private examService: ExamService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.isSupervisor = this.authService.getUser()?.role === 'supervisor';

        this.examService.getMine().subscribe({
            next: (exams) => {
                const upcoming = exams
                    .filter(
                        (e) =>
                            e.status === 'scheduled' ||
                            e.status === 'in_progress'
                    )
                    .sort(
                        (a, b) =>
                            new Date(a.scheduledAt).getTime() -
                            new Date(b.scheduledAt).getTime()
                    );

                this.nextExam = upcoming[0] ?? null;
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }
}
