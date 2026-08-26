import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportService, Report } from '../../core/services/report.service';
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

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private reportService: ReportService,
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
        });
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
