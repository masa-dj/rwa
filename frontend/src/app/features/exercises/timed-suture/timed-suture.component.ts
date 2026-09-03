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
    filter,
    map,
    share,
    startWith,
    switchMap,
    takeUntil,
    withLatestFrom,
    auditTime,
} from 'rxjs/operators';
import { Point } from '../../../core/models/app.models';

type StitchStatus = 'pending' | 'active' | 'completed' | 'missed';

interface Stitch {
    id: string;
    entry: Point;
    exit: Point;
    status: StitchStatus;
    precision: number;
    targetKey: string;
}

export interface TimedSutureResult {
    precision: number;
    completed: number;
    total: number;
    avgReactionTimeMs: number;
    score: number;
}

export interface TimedSutureTelemetrySnapshot {
    stitches: { id: string; entry: Point; exit: Point; status: StitchStatus }[];
    activeIndex: number;
    cursor: Point | null;
    isKeyHeld: boolean;
    isOutOfBounds: boolean;
    timeRemaining: number;
    activeKey: string;
}

const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 360;
const STITCH_COUNT = 5;
const START_RADIUS = 5;
const TOLERANCE = 7;
const STITCH_TIME_MS = 4000;
const TICK_MS = 50;
const TOTAL_DURATION_MS = 300000;
const KEY_POOL = ['A', 'S', 'D', 'F', 'W', 'E', 'R', 'M', 'N', 'H', 'P', 'O'];

@Component({
    selector: 'app-timed-suture',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './timed-suture.component.html',
    styleUrls: ['./timed-suture.component.scss'],
})
export class TimedSutureComponent implements OnInit, AfterViewInit, OnDestroy {
    @Output() finished = new EventEmitter<TimedSutureResult>();
    @Output() telemetry = new EventEmitter<TimedSutureTelemetrySnapshot>();
    @Output() surgicalEvent = new EventEmitter<{ type: string; x?: number; y?: number; payload?: any }>();

    @ViewChild('canvas', { static: true })
    canvasRef!: ElementRef<HTMLDivElement>;

    stitches: Stitch[] = [];
    activeIndex = 0;
    cursor: Point | null = null;
    isOutOfBounds = false;
    isKeyHeld = false;
    timeRemaining = TOTAL_DURATION_MS;

    private destroy$ = new Subject<void>();
    private stitchAdvance$ = new Subject<void>();
    private lastPointerPos: Point = { x: -1000, y: -1000 };
    private ended = false;

    private attemptFurthestT = 0;
    private attemptTicks = 0;
    private attemptInBoundsTicks = 0;

    private stitchReactionMs: number[] = [];
    private completedPrecisions: number[] = [];
    private activatedAt = 0;
    readonly Math = Math;

    ngOnInit() {
        this.stitches = this.generateStitches();
        this.stitchReactionMs = new Array(this.stitches.length).fill(-1);

        interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                () =>
                    (this.timeRemaining = Math.max(
                        0,
                        this.timeRemaining - 1000
                    ))
            );

        timer(TOTAL_DURATION_MS)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.end());
    }

    ngAfterViewInit() {
        const el = this.canvasRef.nativeElement;
        const pulse$ = interval(TICK_MS).pipe(
            share(),
            takeUntil(this.destroy$)
        );

        const pointerMove$ = fromEvent<PointerEvent>(el, 'pointermove').pipe(
            map((e) => this.relativePos(e)),
            share()
        );
        pointerMove$
            .pipe(takeUntil(this.destroy$))
            .subscribe((p) => (this.lastPointerPos = p));

        const pointerDown$ = fromEvent<PointerEvent>(el, 'pointerdown').pipe(
            map((e) => this.relativePos(e))
        );

        const release$ = merge(
            fromEvent(el, 'pointerup'),
            fromEvent(el, 'pointerleave'),
            fromEvent(window, 'blur')
        );

        const keyDown$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
            filter(
                (e) =>
                    !e.repeat && e.key.toUpperCase() === this.currentTargetKey
            )
        );

        const keyUp$ = fromEvent<KeyboardEvent>(window, 'keyup').pipe(
            filter((e) => e.key.toUpperCase() === this.currentTargetKey)
        );

        keyDown$.pipe(takeUntil(this.destroy$)).subscribe((e) => {
            e.preventDefault();
            this.isKeyHeld = true;

            if (this.stitchReactionMs[this.activeIndex] === -1) {
                this.stitchReactionMs[this.activeIndex] =
                    Date.now() - this.activatedAt;
            }
        });

        merge(keyUp$, fromEvent(window, 'blur'))
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => (this.isKeyHeld = false));

        const interruption$ = merge(release$, keyUp$);

        this.activateStitch(0, pulse$, interruption$);

        pointerDown$
            .pipe(
                filter((pos) => this.isKeyHeld && this.isNearActiveEntry(pos)),
                switchMap(() => {
                    this.attemptFurthestT = 0;
                    this.attemptTicks = 0;
                    this.attemptInBoundsTicks = 0;

                    return pulse$.pipe(
                        withLatestFrom(
                            pointerMove$.pipe(startWith(this.lastPointerPos))
                        ),
                        takeUntil(interruption$),
                        takeUntil(this.stitchAdvance$),
                        takeUntil(this.destroy$)
                    );
                })
            )
            .subscribe(([, pos]) => this.onDragTick(pos));

        pulse$
            .pipe(auditTime(50), takeUntil(this.destroy$))
            .subscribe(() => this.emitTelemetry());
    }

    private relativePos(e: PointerEvent): Point {
        const rect = this.canvasRef.nativeElement.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    private isNearActiveEntry(pos: Point): boolean {
        const stitch = this.stitches[this.activeIndex];
        if (!stitch) return false;
        const dx = pos.x - stitch.entry.x;
        const dy = pos.y - stitch.entry.y;
        return Math.sqrt(dx * dx + dy * dy) <= START_RADIUS;
    }

    get currentTargetKey(): string {
        return this.stitches[this.activeIndex]?.targetKey || '';
    }
    private onDragTick(pos: Point) {
        if (this.ended) return;
        const stitch = this.stitches[this.activeIndex];
        if (!stitch) return;

        this.cursor = pos;

        const { t, distance } = this.projectOntoSegment(
            pos,
            stitch.entry,
            stitch.exit
        );
        this.attemptTicks++;
        const inBounds = distance <= TOLERANCE;
        this.isOutOfBounds = !inBounds;
        if (inBounds) this.attemptInBoundsTicks++;

        this.attemptFurthestT = Math.max(this.attemptFurthestT, t);

        if (t >= 0.95 && distance <= TOLERANCE) {
            this.completeStitch(stitch);
        }
    }

    private projectOntoSegment(
        pos: Point,
        a: Point,
        b: Point
    ): { t: number; distance: number } {
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const lengthSq = abx * abx + aby * aby || 1;
        let t = ((pos.x - a.x) * abx + (pos.y - a.y) * aby) / lengthSq;
        t = Math.max(0, Math.min(1, t));
        const projX = a.x + abx * t;
        const projY = a.y + aby * t;
        const dx = pos.x - projX;
        const dy = pos.y - projY;
        return { t, distance: Math.sqrt(dx * dx + dy * dy) };
    }

    private completeStitch(stitch: Stitch) {
        stitch.status = 'completed';
        const precision = this.attemptTicks > 0 ? Math.round((this.attemptInBoundsTicks / this.attemptTicks) * 100) : 0;
        stitch.precision = precision;
        this.completedPrecisions.push(precision);

        this.surgicalEvent.emit({
          type: 'stitch_completed',
          x: stitch.exit.x,
          y: stitch.exit.y,
          payload: { precision, key: stitch.targetKey },
        });

        this.cursor = null;
        this.stitchAdvance$.next();
        this.advance();
      }

    private activateStitch(
        index: number,
        pulse$: ReturnType<typeof interval>,
        interruption$: any
    ) {
        if (index >= this.stitches.length) {
            this.end();
            return;
        }

        this.activeIndex = index;
        this.stitches[index].status = 'active';
        this.activatedAt = Date.now();

        timer(STITCH_TIME_MS)
            .pipe(takeUntil(this.stitchAdvance$), takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.stitches[index].status === 'active') {
                  this.stitches[index].status = 'missed';
                  this.surgicalEvent.emit({ type: 'stitch_missed', payload: { key: this.stitches[index].targetKey } }); // 👈 add
                  this.advance();
                }
              });
    }

    private advance() {
        this.isKeyHeld = false;
        const nextIndex = this.activeIndex + 1;
        if (nextIndex >= this.stitches.length) {
            this.end();
            return;
        }
        this.activeIndex = nextIndex;
        this.stitches[nextIndex].status = 'active';
        this.activatedAt = Date.now();

        timer(STITCH_TIME_MS)
            .pipe(takeUntil(this.stitchAdvance$), takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.stitches[nextIndex].status === 'active') {
                    this.stitches[nextIndex].status = 'missed';
                    this.advance();
                }
            });
    }

    private generateStitches(): Stitch[] {
        const marginX = 60;
        const spacing = (CANVAS_WIDTH - marginX * 2) / STITCH_COUNT;
        const centerY = CANVAS_HEIGHT / 2;
        const shuffledKeys = [...KEY_POOL].sort(() => Math.random() - 0.5);
        const stitches: Stitch[] = [];
        for (let i = 0; i < STITCH_COUNT; i++) {
            const cx = marginX + spacing * (i + 0.5);
            const flip = i % 2 === 0 ? 1 : -1;
            stitches.push({
                id: crypto.randomUUID(),
                entry: { x: cx - 22, y: centerY - 28 * flip },
                exit: { x: cx + 22, y: centerY + 28 * flip },
                status: 'pending',
                precision: 0,
                targetKey: shuffledKeys[i],
            });
        }
        return stitches;
    }

    private emitTelemetry() {
        this.telemetry.emit({
            stitches: this.stitches.map((s) => ({
                id: s.id,
                entry: s.entry,
                exit: s.exit,
                status: s.status,
                targetKey: s.targetKey,
            })),
            activeIndex: this.activeIndex,
            cursor: this.cursor,
            isKeyHeld: this.isKeyHeld,
            isOutOfBounds: this.isOutOfBounds,
            timeRemaining: this.timeRemaining,
            activeKey: this.currentTargetKey,
        });
    }

    private end() {
        if (this.ended) return;
        this.ended = true;

        const total = this.stitches.length;
        const completed = this.completedPrecisions.length;
        const completionRate = Math.round((completed / total) * 100);

        const precision =
            completed > 0 ?
                Math.round(
                    this.completedPrecisions.reduce((a, b) => a + b, 0) / completed
                )
                : 0;

        const filledReactions = this.stitchReactionMs.map((r) =>
            r === -1 ? STITCH_TIME_MS : r
        );
        const avgReactionTimeMs = Math.round(
            filledReactions.reduce((a, b) => a + b, 0) / filledReactions.length
        );

        const reactionScores = filledReactions.map((r) =>
            Math.max(
                0,
                Math.min(100, Math.round(100 - (r / STITCH_TIME_MS) * 100))
            )
        );
        const reactionScore = Math.round(
            reactionScores.reduce((a, b) => a + b, 0) / reactionScores.length
        );

        const score = Math.round(
            completionRate * 0.4 + precision * 0.3 + reactionScore * 0.3
        );

        this.finished.emit({
            precision,
            completed,
            total,
            avgReactionTimeMs,
            score,
        });
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
