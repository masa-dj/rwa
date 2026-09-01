import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExamsState, examsAdapter } from './exam.reducer';

export const selectExamsState = createFeatureSelector<ExamsState>('exams');

const { selectAll } = examsAdapter.getSelectors();

export const selectAllExams = createSelector(selectExamsState, selectAll);
export const selectExamsLoading = createSelector(selectExamsState, (s) => s.loading);

export const selectAllExamsSorted = createSelector(selectAllExams, (exams) => {
    return exams
        .slice()
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
});

export const selectExamsLoaded = createSelector(selectExamsState, (s) => s.loaded);
