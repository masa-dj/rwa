import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExerciseType } from '../../../core/models/app.models';
import { PresenceService } from '../../../core/services/presence.service';
import { PresenceUser } from '../../../core/models/app.models';
import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-schedule-exam',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SidebarComponent,
        ButtonComponent,
    ],
    templateUrl: './schedule-exam.component.html',
    styleUrls: ['./schedule-exam.component.scss'],
})
export class ScheduleExamComponent implements OnInit {
    form!: FormGroup;
    students$!: Observable<PresenceUser[]>;
    errorMessage = '';
    submitted = false;

    exerciseTypes: { value: ExerciseType; label: string }[] = [
        { value: 'steady_path', label: 'Steady Path' },
        { value: 'timed_suture', label: 'Timed Suture' },
        { value: 'vessel_cauterization', label: 'Vessel Cauterization' },
    ];

    constructor(
        private fb: FormBuilder,
        private examService: ExamService,
        private presenceService: PresenceService,
        private router: Router
    ) {
        this.form = this.fb.group({
            studentId: ['', Validators.required],
            exerciseType: ['', Validators.required],
            scheduledAt: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.students$ = this.presenceService.presenceList$;
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.errorMessage = '';

        const raw = this.form.getRawValue();
        this.examService
            .schedule({
                studentId: raw.studentId,
                exerciseType: raw.exerciseType,
                scheduledAt: new Date(raw.scheduledAt).toISOString(),
            })
            .subscribe({
                next: () => (this.submitted = true),
                error: (err) =>
                    (this.errorMessage =
                        err.error?.message || 'Failed to schedule exam'),
            });
    }

    backToDashboard() {
        this.router.navigate(['/dashboard']);
    }

    get minDateTime(): string {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }
}
