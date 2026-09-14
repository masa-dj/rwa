import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent, interval, merge, timer } from 'rxjs';
import {
    auditTime,
    map,
    share,
    startWith,
    switchMap,
    takeUntil,
    withLatestFrom,
} from 'rxjs/operators';
import { Point } from '../../../core/models/app.models';


export interface SteadyPathResult {
    precision: number;
    completion: number;
}

export interface SteadyPathTelemetrySnapshot {
    pathD: string;
    cursor: Point | null;
    isOutOfBounds: boolean;
    progressPercent: number;
    timeRemaining: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 360;
const PADDING = 40;
const WAYPOINT_COUNT = 10;
const TOLERANCE_RADIUS = 5;
const SAMPLE_STEP_PX = 4;
const TICK_MS = 50;
const DURATION_MS = 20000;
const LOOKAHEAD_SAMPLES = 20;

@Component({
    selector: 'app-steady-path',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './steady-path.component.html',
    styleUrls: ['./steady-path.component.scss'],
})
export class SteadyPathComponent implements OnInit, AfterViewInit, OnDestroy {
    @Output() finished = new EventEmitter<SteadyPathResult>();
    @Output() telemetry = new EventEmitter<SteadyPathTelemetrySnapshot>();
    @Output() surgicalEvent = new EventEmitter<{
        type: string;
        x?: number;
        y?: number;
        payload?: any;
    }>();

    @ViewChild('canvas', { static: true })
    canvasRef!: ElementRef<HTMLDivElement>;
    @ViewChild('pathEl', { static: true })
    pathElRef!: ElementRef<SVGPathElement>;

    pathD = '';
    cursor: Point | null = null;
    isOutOfBounds = false;
    timeRemaining = DURATION_MS;
    progressPercent = 0;

    private destroy$ = new Subject<void>();
    private samples: Point[] = [];
    private furthestIndex = 0;
    private inBoundsTicks = 0;
    private draggingTicks = 0;
    private lastPointerPos: Point = { x: -1000, y: -1000 };
    private ended = false;

    ngOnInit() {
        this.pathD = this.generateVesselPath();

        interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                () =>
                    (this.timeRemaining = Math.max(
                        0,
                        this.timeRemaining - 1000
                    ))
            );

        timer(DURATION_MS)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.end());
    }

    ngAfterViewInit() {
        //must happen after view init, path needs to be in the DOM
        const pathEl = this.pathElRef.nativeElement;
        const totalLength = pathEl.getTotalLength();
        const sampleCount = Math.ceil(totalLength / SAMPLE_STEP_PX);

        for (let i = 0; i <= sampleCount; i++) {
            const pt = pathEl.getPointAtLength((i / sampleCount) * totalLength);
            this.samples.push({ x: pt.x, y: pt.y });
        }

        const el = this.canvasRef.nativeElement;

        const pulse$ = interval(TICK_MS).pipe(
            share(),
            takeUntil(this.destroy$)
        );

        pulse$
            .pipe(auditTime(50), takeUntil(this.destroy$))
            .subscribe(() => this.emitTelemetry());

        const pointerMove$ = fromEvent<PointerEvent>(el, 'pointermove').pipe(
            map((e) => this.relativePos(e)),
            share()
        );
        pointerMove$
            .pipe(takeUntil(this.destroy$))
            .subscribe((p) => (this.lastPointerPos = p));

        const pointerDown$ = fromEvent<PointerEvent>(el, 'pointerdown');
        const release$ = merge(
            fromEvent(el, 'pointerup'),
            fromEvent(el, 'pointerleave'),
            fromEvent(window, 'blur')
        );

        pointerDown$
            .pipe(
                switchMap(() =>
                    pulse$.pipe(
                        withLatestFrom(
                            pointerMove$.pipe(startWith(this.lastPointerPos))
                        ),
                        takeUntil(release$)
                    )
                ),
                takeUntil(this.destroy$)
            )
            .subscribe(([, pos]) => this.onDragTick(pos));

        release$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.cursor = null;
            this.isOutOfBounds = false;
        });
    }

    private relativePos(e: PointerEvent): Point {
        const rect = this.canvasRef.nativeElement.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    private onDragTick(pos: Point) {
        if (this.ended) return;

        this.cursor = pos;
        const { index, distance } = this.nearestSampleInWindow(pos);

        this.draggingTicks++;
        const inBounds = distance <= TOLERANCE_RADIUS;
        this.isOutOfBounds = !inBounds;

        if (inBounds) {
            this.inBoundsTicks++;
            this.furthestIndex = Math.max(this.furthestIndex, index);
            this.progressPercent = Math.round(
                (this.furthestIndex / (this.samples.length - 1)) * 100
            );
        }
        if (this.furthestIndex >= this.samples.length - 1) {
            this.end();
        }
    }

    private nearestSampleInWindow(pos: Point): {
        index: number;
        distance: number;
    } {
        const start = this.furthestIndex;
        const end = Math.min(
            this.samples.length - 1,
            this.furthestIndex + LOOKAHEAD_SAMPLES
        );

        let best = { index: this.furthestIndex, distance: Infinity };
        for (let i = start; i <= end; i++) {
            const dx = pos.x - this.samples[i].x;
            const dy = pos.y - this.samples[i].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < best.distance) best = { index: i, distance: d };
        }
        return best;
    }

    private generateVesselPath(): string {
        const points: Point[] = [];
        const usableWidth = CANVAS_WIDTH - PADDING * 2;
        const segment = usableWidth / (WAYPOINT_COUNT - 1);

        for (let i = 0; i < WAYPOINT_COUNT; i++) {
            const x =
                PADDING + segment * i + (Math.random() - 0.5) * segment * 0.4;
            const y = PADDING + Math.random() * (CANVAS_HEIGHT - PADDING * 2);
            points.push({ x, y });
        }

        return this.catmullRomSpline(points);
    }

    private catmullRomSpline(points: Point[]): string {
        if (points.length < 2) return '';
        const p = [points[0], ...points, points[points.length - 1]];

        let d = `M ${p[1].x} ${p[1].y}`;
        for (let i = 1; i < p.length - 2; i++) {
            const p0 = p[i - 1],
                p1 = p[i],
                p2 = p[i + 1],
                p3 = p[i + 2];
            const c1x = p1.x + (p2.x - p0.x) / 6;
            const c1y = p1.y + (p2.y - p0.y) / 6;
            const c2x = p2.x - (p3.x - p1.x) / 6;
            const c2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    }

    private emitTelemetry() {
        this.telemetry.emit({
            pathD: this.pathD,
            cursor: this.cursor,
            isOutOfBounds: this.isOutOfBounds,
            progressPercent: this.progressPercent,
            timeRemaining: this.timeRemaining,
        });
    }

    private end() {
        if (this.ended) return;
        this.ended = true;

        const precision =
            this.draggingTicks > 0
                ? Math.round((this.inBoundsTicks / this.draggingTicks) * 100)
                : 0;

        this.surgicalEvent.emit({
            type:
                this.furthestIndex >= this.samples.length - 1
                    ? 'path_completed'
                    : 'path_timeout',
            payload: { precision, completion: this.progressPercent },
        });

        this.finished.emit({ precision, completion: this.progressPercent });
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    formatTime(ms: number): string {
        return `0:${Math.ceil(ms / 1000)
            .toString()
            .padStart(2, '0')}`;
    }
}
