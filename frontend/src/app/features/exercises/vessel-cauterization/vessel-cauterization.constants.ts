export interface Target {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    holdProgress: number;
}

export interface CauterizationResult {
    sealed: number;
    missed: number;
}

export interface VesselCauterizationTelemetrySnapshot {
    targets: {
        id: string;
        x: number;
        y: number;
        radius: number;
        holdProgress: number;
    }[];
    sealedCount: number;
    timeRemaining: number;
    pointer: { x: number; y: number } | null;
}

export const CANVAS_WIDTH = 560;
export const CANVAS_HEIGHT = 360;
export const TARGET_RADIUS = 24;
export const HOLD_DURATION_MS = 3000;
export const TICK_MS = 50;
export const SPAWN_INTERVAL_MS = 2950;
export const EXAM_DURATION_MS = 30000;
export const MAX_TARGETS = 5;
