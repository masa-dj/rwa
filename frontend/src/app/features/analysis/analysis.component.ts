import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import * as SessionActions from '../../state/sessions/session.actions';
import {
    selectScoreTrend,
    selectAvgScoreByExercise,
    selectCompletionStats,
    selectAvgPrecision,
    selectSessionsLoading,
} from '../../state/sessions/session.selectors';

interface TrendPoint {
    date: string;
    score: number;
    exerciseType: string;
    mode: string;
}

@Component({
    selector: 'app-analysis',
    standalone: true,
    imports: [CommonModule, SidebarComponent],
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.scss'],
})
export class AnalysisComponent implements OnInit {
    scoreTrend$: Observable<TrendPoint[]>;
    avgByExercise$: Observable<
        { exerciseType: string; avgScore: number; count: number }[]
    >;
    completionStats$: Observable<{
        total: number;
        completed: number;
        aborted: number;
        completionRate: number;
    }>;
    avgPrecision$: Observable<number>;
    loading$: Observable<boolean>;

    exerciseLabels: Record<string, string> = {
        steady_path: 'Steady Path',
        timed_suture: 'Timed Suture',
        vessel_cauterization: 'Vessel Cauterization',
    };

    constructor(private store: Store) {
        this.scoreTrend$ = this.store.select(selectScoreTrend);
        this.avgByExercise$ = this.store.select(selectAvgScoreByExercise);
        this.completionStats$ = this.store.select(selectCompletionStats);
        this.avgPrecision$ = this.store.select(selectAvgPrecision);
        this.loading$ = this.store.select(selectSessionsLoading);
    }

    ngOnInit() {
        this.store.dispatch(SessionActions.loadSessions());
    }

    buildLinePoints(trend: TrendPoint[]): string {
        if (trend.length === 0) return '';
        const width = 520;
        const height = 160;
        const step = trend.length > 1 ? width / (trend.length - 1) : 0;

        const points: string[] = [];
        trend.forEach((point, i) => {
            const x = trend.length === 1 ? width / 2 : i * step;
            const y = height - (point.score / 100) * height;
            points.push(`${x},${y}`);
        });
        return points.join(' ');
    }

    dotX(trend: TrendPoint[], i: number): number {
        return trend.length === 1 ? 260 : i * (520 / (trend.length - 1));
    }

    dotY(score: number): number {
        return 160 - (score / 100) * 160;
    }
}
