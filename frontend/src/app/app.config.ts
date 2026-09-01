import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { sessionReducer } from './state/sessions/session.reducer';
import { provideEffects } from '@ngrx/effects';
import { SessionEffects } from './state/sessions/session.effects';
import { examsReducer } from './state/exams/exam.reducer';
import { ExamEffects } from './state/exams/exam.effects';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideStore({ sessions: sessionReducer, exams: examsReducer, }),
        provideEffects([SessionEffects, ExamEffects,]),
    ],
};
