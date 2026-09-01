import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import * as ExamActions from './exam.actions';
import { catchError, interval, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ExamService } from '../../core/services/exam.service';

@Injectable()
export class ExamEffects {
    loadExams$;
    pollExams$;
    constructor(
        private actions$: Actions,
        private examService: ExamService,
        private authService: AuthService
    ) {
        this.loadExams$ = createEffect(() =>
            this.actions$.pipe(
                ofType(ExamActions.loadExams),
                switchMap(() => {
                    const isSupervisor = this.authService.getUser()?.role === 'supervisor';
                    const source$ = isSupervisor? this.examService.getAll() : this.examService.getMine();

                    return source$.pipe(
                        map((exams) => ExamActions.loadExamsSuccess({exams})),
                        catchError((e) =>
                            of(ExamActions.loadExamsFailure({error: e.message ?? 'Failed to lod exams'})),
                        )
                    );
                }),
            )
        );

        this.pollExams$ = createEffect(() =>
            interval(5000).pipe(map(() => ExamActions.loadExams()))
        )
    }
}
