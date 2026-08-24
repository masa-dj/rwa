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
import {
  Subject,
  fromEvent,
  interval,
  merge,
  timer,
} from 'rxjs';
import { map, share, startWith, switchMap, takeUntil,withLatestFrom, auditTime } from 'rxjs/operators';

interface Target {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  holdProgress: number;
}

interface Point {
  x: number;
  y: number;
}

export interface CauterizationResult {
  sealed: number;
  missed: number;
}

export interface TelemetrySnapshot {
  targets: { id: string; x: number; y: number; radius: number; holdProgress: number }[];
  sealedCount: number;
  timeRemaining: number;
  pointer: { x: number; y: number } | null;
}

const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 360;
const TARGET_RADIUS = 24;
const HOLD_DURATION_MS = 3000;
const TICK_MS = 50;
const SPAWN_INTERVAL_MS = 2900;
const EXAM_DURATION_MS = 60000;
const MAX_TARGETS = 5;

@Component({
  selector: 'app-vessel-cauterization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vessel-cauterization.component.html',
  styleUrls: ['./vessel-cauterization.component.scss'],
})
export class VesselCauterizationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() durationMs = EXAM_DURATION_MS;
  @Output() finished = new EventEmitter<CauterizationResult>();
  @Output() telemetry = new EventEmitter<TelemetrySnapshot>();
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;

  targets: Target[] = [];
  timeRemaining = this.durationMs;
  sealedCount = 0;
  missedCount = 0;

  private destroy$ = new Subject<void>();
  private lastPointerPos: Point = { x: -1000, y: -1000 };
  private activeTargetId: string | null = null;
  private holdProgressMs = 0;
  private hasPointerEntered = false;

  ngOnInit() {
    //countdown, change later if one min doesnt make sense
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => (this.timeRemaining = Math.max(0, this.timeRemaining - 1000)));

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
    const pulse$ = interval(TICK_MS).pipe(share(), takeUntil(this.destroy$));

    pulse$.subscribe(() => this.moveTargets());

    const pointerMove$ = fromEvent<PointerEvent>(el, 'pointermove').pipe(
      map((e) => this.relativePos(e)),
      share(),
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
      fromEvent(window, 'blur'),
    );

    pointerDown$
      .pipe(
        switchMap(() =>
          pulse$.pipe(
            withLatestFrom(pointerMove$.pipe(startWith(this.lastPointerPos))),
            takeUntil(release$),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe(([, pos]) => this.onHoldTick(pos));

    release$.pipe(takeUntil(this.destroy$)).subscribe(() => this.resetHold());
    fromEvent(el, 'pointerleave').pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.hasPointerEntered = false;
    });
    pulse$.pipe(auditTime(50), takeUntil(this.destroy$)).subscribe(() => this.emitTelemetry());

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
      x: TARGET_RADIUS + Math.random() * (CANVAS_WIDTH - TARGET_RADIUS * 2),
      y: TARGET_RADIUS + Math.random() * (CANVAS_HEIGHT - TARGET_RADIUS * 2),
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
      if (t.y - t.radius < 0 || t.y + t.radius > CANVAS_HEIGHT) t.vy *= -1;

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
    target.holdProgress = Math.min(this.holdProgressMs / HOLD_DURATION_MS, 1);

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
    this.targets = this.targets.filter((t) => t.id !== id);
    this.sealedCount++;
  }

  private end() {
    this.missedCount = this.targets.length;
    this.finished.emit({ sealed: this.sealedCount, missed: this.missedCount });
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatTime(ms: number): string {
    const seconds = Math.ceil(ms / 1000);
    return `0:${seconds.toString().padStart(2, '0')}`;
  }

  private emitTelemetry() {
    this.telemetry.emit({
      targets: this.targets.map((t) => ({ id: t.id, x: t.x, y: t.y, radius: t.radius, holdProgress: t.holdProgress })),
      sealedCount: this.sealedCount,
      timeRemaining: this.timeRemaining,
      pointer: this.hasPointerEntered ? this.lastPointerPos : null,
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
