import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportService, Report } from '../../core/services/report.service';
import { ExamService } from '../../core/services/exam.service';
import {
    SurgicalEventService,
    SurgicalEvent,
} from '../../core/services/surgical-event.service';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
    selector: 'app-report-detail',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SidebarComponent,
        ButtonComponent,
    ],
    templateUrl: './report-detail.component.html',
    styleUrls: ['./report-detail.component.scss'],
})
export class ReportDetailComponent implements OnInit {
    report: Report | null = null;
    loading = true;
    isSupervisor = false;
    form!: FormGroup;
    saved = false;

    events: SurgicalEvent[] = [];

    eventLabels: Record<string, string> = {
        target_sealed: 'Target sealed',
        stitch_completed: 'Stitch completed',
        stitch_missed: 'Stitch missed',
        path_completed: 'Path completed',
        path_timeout: 'Path timed out',
        freeze_triggered: 'Freeze triggered',
        freeze_acknowledged: 'Freeze acknowledged',
        tremor_triggered: 'Tremor triggered',
        exam_aborted: 'Exam aborted',
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private reportService: ReportService,
        private examService: ExamService,
        private surgicalEventService: SurgicalEventService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            supervisorGrade: [''],
            comment: [''],
            highlight: [''],
            recommendsRetry: [false],
        });
    }

    ngOnInit() {
        this.isSupervisor = this.authService.getUser()?.role === 'supervisor';
        const id = this.route.snapshot.paramMap.get('id')!;

        this.reportService.getOne(id).subscribe((report) => {
            this.report = report;
            this.form.patchValue({
                supervisorGrade: report.supervisorGrade ?? '',
                comment: report.comment ?? '',
                highlight: report.highlight ?? '',
                recommendsRetry: report.recommendsRetry,
            });
            this.loading = false;

            this.examService.getOne(report.examId).subscribe((exam) => {
                if (!exam.sessionId) return;
                this.surgicalEventService
                    .getBySession(exam.sessionId)
                    .subscribe((events) => {
                        this.events = events;
                    });
            });
        });
    }

    eventLabel(event: SurgicalEvent): string {
        return this.eventLabels[event.type] ?? event.type;
    }

    save() {
        if (!this.report) return;
        const raw = this.form.getRawValue();

        this.reportService
            .update(this.report.id, {
                supervisorGrade:
                    raw.supervisorGrade === ''
                        ? undefined
                        : Number(raw.supervisorGrade),
                comment: raw.comment,
                highlight: raw.highlight,
                recommendsRetry: raw.recommendsRetry,
            })
            .subscribe((updated) => {
                this.report = updated;
                this.saved = true;
                setTimeout(() => (this.saved = false), 2000);
            });
    }

    backToReports() {
        this.router.navigate(['/reports']);
    }
}
