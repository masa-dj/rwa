import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import * as SessionActions from './session.actions';
import { catchError, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';

@Injectable()
export class SessionEffects {
    loadSessions$;
    constructor(
        private actions$: Actions,
        private sessionService: SessionService,
        private authService: AuthService
    ) {
        this.loadSessions$ = createEffect(() =>
            this.actions$.pipe(
                ofType(SessionActions.loadSessions),
                switchMap(() => {
                    const isSupervisor =
                        this.authService.getUser()?.role === 'supervisor';
                    const source$ = isSupervisor
                        ? this.sessionService.getSupervised()
                        : this.sessionService.getMine();

                    return source$.pipe(
                        take(1),
                        map((sessions) =>
                            SessionActions.loadSessionsSuccess({ sessions })
                        ),
                        catchError((e) =>
                            of(
                                SessionActions.loadSessionsFailure({
                                    error:
                                        e.message ?? 'Failed to load sessions',
                                })
                            )
                        )
                    );
                })
            )
        );
    }
}
