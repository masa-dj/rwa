import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SessionsState, sessionsAdapter } from './session.reducer';

export const selectSessionsState =
    createFeatureSelector<SessionsState>('sessions');
const { selectAll } = sessionsAdapter.getSelectors();

export const selectAllSessions = createSelector(selectSessionsState, selectAll);
export const selectSessionsloading = createSelector(
    selectSessionsState,
    (s) => s.loading
);

export const selectCompletedSessions = createSelector(
    selectAllSessions,
    (sessions) => sessions.filter((s) => s.status === 'completed')
);

export const selectScoreTrend = createSelector(
    selectCompletedSessions,
    (sessions) => {
        sessions
            .slice()
            .sort(
                (a, b) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime()
            )
            .map((s) => ({
                date: s.startTime,
                score: s.score ?? 0,
                exerciseType: s.exerciseType,
                mode: s.mode,
            }));
    }
);

export const selectAvgScoreByExercise = createSelector(
    selectCompletedSessions,
    (sessions) => {
        const group = sessions.reduce((acc, s) => {
            const key = s.exerciseType;
            if (!acc[key]) acc[key] = { total: 0, count: 0 };
            acc[key].total += s.score ?? 0;
            acc[key].count += 1;
            return acc;
        }, {} as Record<string, { total: number; count: number }>);
        return Object.entries(group).map(([exerciseType, v]) => ({
            exerciseType,
            avgScore: Math.round(v.total / v.count),
            count: v.count,
        }));
    }
);

export const selectCompletionStats = createSelector(
    selectAllSessions,
    (sessions) => {
        const total = sessions.length;
        const completed = sessions.filter(
            (s) => s.status === 'completed'
        ).length;
        const aborted = sessions.filter((s) => s.status === 'aborted').length;
        return {
            total,
            completed,
            aborted,
            completionRate:
                total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }
);

export const selectAvgPrecision = createSelector(
    selectCompletedSessions,
    (sessions) => {
        const withPrecision = sessions.filter((s) => s.precisionScore !== null);
        if (withPrecision.length === 0) return 0;
        const sum = withPrecision.reduce(
            (acc, s) => acc + (s.precisionScore ?? 0),
            0
        );
        return Math.round(sum / withPrecision.length);
    }
);
