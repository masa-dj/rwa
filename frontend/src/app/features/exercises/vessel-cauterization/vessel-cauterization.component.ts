import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent, interval, merge, race, timer } from 'rxjs';
import {
    map,
    share,
    startWith,
    switchMap,
    takeUntil,
    withLatestFrom,
    auditTime,
    take,
} from 'rxjs/operators';
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    CauterizationResult,
    EXAM_DURATION_MS,
    HOLD_DURATION_MS,
    MAX_TARGETS,
    SPAWN_INTERVAL_MS,
    TARGET_RADIUS,
    TICK_MS,
    TREMOR_RESPONSE_WINDOW_MS,
    Target,
    VesselCauterizationTelemetrySnapshot,
} from './vessel-cauterization.constants';
import { Point } from '../../../core/models/app.models';

@Component({
    selector: 'app-vessel-cauterization',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vessel-cauterization.component.html',
    styleUrls: ['./vessel-cauterization.component.scss'],
})
export class VesselCauterizationComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @Input() durationMs = EXAM_DURATION_MS;
    @Input() set tremorSignal(value: number) {
        if (value > 0) this.tremorTriggered$.next();
    }
    @Output() finished = new EventEmitter<CauterizationResult>();
    @Output() telemetry =
        new EventEmitter<VesselCauterizationTelemetrySnapshot>();
    @Output() surgicalEvent = new EventEmitter<{
        type: string;
        x?: number;
        y?: number;
        payload?: any;
    }>();

    @ViewChild('canvas', { static: true })
    canvasRef!: ElementRef<HTMLDivElement>;

    targets: Target[] = [];
    timeRemaining = this.durationMs;
    sealedCount = 0;
    missedCount = 0;

    private destroy$ = new Subject<void>();
    private lastPointerPos: Point = { x: -1000, y: -1000 };
    private activeTargetId: string | null = null;
    private holdProgressMs = 0;
    private hasPointerEntered = false;
    private tremorTriggered$ = new Subject<void>();
    private tremorResponses: { compliant: boolean; delayMs: number }[] = [];
    private ended = false;

    ngOnInit() {
        //countdown, change later if one min doesnt make sense
        interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                () =>
                    (this.timeRemaining = Math.max(
                        0,
                        this.timeRemaining - 1000
                    ))
            );

        timer(this.durationMs)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.end());
    }

    ngAfterViewInit() {
        const el = this.canvasRef.nativeElement;

        //spawn targets
        this.spawnTarget();
        interval(SPAWN_INTERVAL_MS)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.spawnTarget());

        //drives movement and holding checks in lockstep
        const pulse$ = interval(TICK_MS).pipe(
            share(),
            takeUntil(this.destroy$)
        );

        pulse$.subscribe(() => this.moveTargets());

        const pointerMove$ = fromEvent<PointerEvent>(el, 'pointermove').pipe(
            map((e) => this.relativePos(e)),
            share()
        );
        pointerMove$.pipe(takeUntil(this.destroy$)).subscribe((p) => {
            this.lastPointerPos = p;
            this.hasPointerEntered = true;
        });

        const pointerDown$ = fromEvent<PointerEvent>(el, 'pointerdown');

        //bad attempt
        const release$ = merge(
            fromEvent(el, 'pointerup'),
            fromEvent(el, 'pointerleave'),
            fromEvent(window, 'blur')
        );

        this.setupTremorResponse(el)

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
            .subscribe(([, pos]) => this.onHoldTick(pos));

        release$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.resetHold());
        fromEvent(el, 'pointerleave')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.hasPointerEntered = false;
            });
        pulse$
            .pipe(auditTime(50), takeUntil(this.destroy$))
            .subscribe(() => this.emitTelemetry());
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private relativePos(e: PointerEvent): Point {
        const rect = this.canvasRef.nativeElement.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    private spawnTarget() {
        if (this.targets.length >= MAX_TARGETS) return;

        const angle = Math.random() * Math.PI * 2;
        const speed = 12 + Math.random() * 10;

        this.targets.push({
            id: crypto.randomUUID(),
            x:
                TARGET_RADIUS +
                Math.random() * (CANVAS_WIDTH - TARGET_RADIUS * 2),
            y:
                TARGET_RADIUS +
                Math.random() * (CANVAS_HEIGHT - TARGET_RADIUS * 2),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: TARGET_RADIUS,
            holdProgress: 0,
        });
    }

    private moveTargets() {
        const dt = TICK_MS / 1000;
        for (const t of this.targets) {
            t.x += t.vx * dt;
            t.y += t.vy * dt;

            if (t.x - t.radius < 0 || t.x + t.radius > CANVAS_WIDTH) t.vx *= -1;
            if (t.y - t.radius < 0 || t.y + t.radius > CANVAS_HEIGHT)
                t.vy *= -1;

            t.x = Math.max(t.radius, Math.min(CANVAS_WIDTH - t.radius, t.x));
            t.y = Math.max(t.radius, Math.min(CANVAS_HEIGHT - t.radius, t.y));
        }
    }

    private onHoldTick(pos: Point) {
        const target = this.findTargetUnder(pos);

        if (!target) {
            this.resetHold();
            return;
        }

        if (this.activeTargetId !== target.id) {
            this.activeTargetId = target.id;
            this.holdProgressMs = 0;
        }

        this.holdProgressMs += TICK_MS;
        target.holdProgress = Math.min(
            this.holdProgressMs / HOLD_DURATION_MS,
            1
        );

        if (this.holdProgressMs >= HOLD_DURATION_MS) {
            this.sealTarget(target.id);
            this.resetHold();
        }
    }

    private resetHold() {
        const active = this.targets.find((t) => t.id === this.activeTargetId);
        if (active) active.holdProgress = 0;
        this.activeTargetId = null;
        this.holdProgressMs = 0;
    }

    private findTargetUnder(pos: Point): Target | null {
        return (
            this.targets.find((t) => {
                const dx = pos.x - t.x;
                const dy = pos.y - t.y;
                return Math.sqrt(dx * dx + dy * dy) <= t.radius;
            }) ?? null
        );
    }

    private sealTarget(id: string) {
        const target = this.targets.find((t) => t.id === id);
        this.targets = this.targets.filter((t) => t.id !== id);
        this.sealedCount++;

        if (target) {
            this.surgicalEvent.emit({
                type: 'target_sealed',
                x: target.x,
                y: target.y,
            });
        }
    }

    private setupTremorResponse(el: HTMLDivElement) {
        this.tremorTriggered$.pipe(takeUntil(this.destroy$)).subscribe(() => {
          if (!this.activeTargetId) return; // not mid-hold, nothing to test

          const start = Date.now();
          race(
            fromEvent(el, 'pointerup').pipe(map(() => true)),
            timer(TREMOR_RESPONSE_WINDOW_MS).pipe(map(() => false)),
          ).pipe(take(1), takeUntil(this.destroy$))
            .subscribe((released) => {
              this.tremorResponses.push({ compliant: released, delayMs: Date.now() - start });
              if (!released) this.resetHold(); // force-fail: they kept dragging through the disturbance
            });
        });
      }

      private computeTremorIndex(): number {
        if (this.tremorResponses.length === 0) return 100; // never disturbed — no penalty
        const scores = this.tremorResponses.map((r) =>
          r.compliant ? Math.max(0, Math.round(100 - (r.delayMs / TREMOR_RESPONSE_WINDOW_MS) * 100)) : 0,
        );
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }

      private end() {
        if (this.ended) return;
        this.ended = true;
        this.missedCount = this.targets.length;
        this.finished.emit({ sealed: this.sealedCount, missed: this.missedCount, tremorIndex: this.computeTremorIndex() });
        this.destroy$.next();
        this.destroy$.complete();
      }

    formatTime(ms: number): string {
        const seconds = Math.ceil(ms / 1000);
        return `0:${seconds.toString().padStart(2, '0')}`;
    }

    private emitTelemetry() {
        this.telemetry.emit({
            targets: this.targets.map((t) => ({
                id: t.id,
                x: t.x,
                y: t.y,
                radius: t.radius,
                holdProgress: t.holdProgress,
            })),
            sealedCount: this.sealedCount,
            timeRemaining: this.timeRemaining,
            pointer: this.hasPointerEntered ? this.lastPointerPos : null,
        });
    }
}
