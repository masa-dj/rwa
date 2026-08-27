import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ExamService, Exam } from '../../core/services/exam.service';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ReportService } from '../../core/services/report.service';

@Component({
    selector: 'app-exams',
    standalone: true,
    imports: [CommonModule, SidebarComponent, ButtonComponent],
    templateUrl: './exams.component.html',
    styleUrls: ['./exams.component.scss'],
})
export class ExamsComponent implements OnInit, OnDestroy {
    isSupervisor = false;
    exams: Exam[] = [];
    reportedExamIds = new Set<string>();
    loading = true;
    now = new Date();

    exerciseLabels: Record<string, string> = {
        steady_path: 'Steady Path',
        timed_suture: 'Timed Suture',
        vessel_cauterization: 'Vessel Cauterization',
    };

    private tick?: Subscription;
    private examsPoll?: Subscription;

    constructor(
        private examService: ExamService,
        private authService: AuthService,
        private reportService: ReportService,
        private router: Router
    ) {}

    ngOnInit() {
        this.isSupervisor = this.authService.getUser()?.role === 'supervisor';
        this.load();
        this.loadReportedIds();
        this.tick = interval(15000).subscribe(() => (this.now = new Date()));
        this.examsPoll = interval(5000).subscribe(() => {
            this.load();
            this.loadReportedIds();
        });
    }

    ngOnDestroy() {
        this.tick?.unsubscribe();
        this.examsPoll?.unsubscribe();
    }

    load() {
        const source = this.isSupervisor ? this.examService.getAll() : this.examService.getMine();
        source.subscribe({
          next: (exams) => {
            this.exams = exams.sort(
              (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
            );
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
      }

    canOpenRoom(exam: Exam): boolean {
        if (exam.status !== 'scheduled') return false;
        const earliest = new Date(
            new Date(exam.scheduledAt).getTime() - 15 * 60 * 1000
        );
        return this.now >= earliest;
    }

    canEnterAsSupervisor(exam: Exam): boolean {
        return exam.status === 'ready_check' || exam.status === 'in_progress';
    }

    canJoinAsStudent(exam: Exam): boolean {
        if (exam.status === 'in_progress') return true;
        if (exam.status !== 'ready_check') return false;
        const latest = new Date(
            new Date(exam.scheduledAt).getTime() + 5 * 60 * 1000
        );
        return this.now <= latest;
    }

    openRoom(exam: Exam) {
        this.examService.openRoom(exam.id).subscribe(() => {
            this.router.navigate(['/exams', exam.id, 'room']);
        });
    }

    enterRoom(exam: Exam) {
        this.router.navigate(['/exams', exam.id, 'room']);
    }

    scheduleExam() {
        this.router.navigate(['/exams/schedule']);
    }
    private loadReportedIds() {
        if (!this.isSupervisor) return;
        this.reportService.getMine().subscribe((reports) => {
          this.reportedExamIds = new Set(reports.map((r) => r.examId));
        });
      }

      canGrade(exam: Exam): boolean {
        return this.isSupervisor && exam.status === 'completed' && !this.reportedExamIds.has(exam.id);
      }

      gradeExam(exam: Exam) {
        this.reportService.create(exam.id).subscribe((report) => {
          this.router.navigate(['/reports', report.id]);
        });
      }
}
