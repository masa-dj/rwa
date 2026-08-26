import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimedSutureTelemetrySnapshot } from '../timed-suture/timed-suture.component';

@Component({
    selector: 'app-timed-suture-live-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './timed-suture-live-view.component.html',
    styleUrls: ['./timed-suture-live-view.component.scss'],
})
export class TimedSutureLiveViewComponent {
    @Input() snapshot: TimedSutureTelemetrySnapshot | null = null;
    readonly Math = Math;

    formatTime(ms: number): string {
        return `0:${Math.ceil(ms / 1000)
            .toString()
            .padStart(2, '0')}`;
    }
}
