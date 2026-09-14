import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VesselCauterizationTelemetrySnapshot } from '../vessel-cauterization/vessel-cauterization.constants';

@Component({
    selector: 'app-vessel-cauterization-live-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vessel-cauterization-live-view.component.html',
    styleUrls: ['./vessel-cauterization-live-view.component.scss'],
})
export class VesselCauterizationLiveViewComponent {
    @Input() snapshot: VesselCauterizationTelemetrySnapshot | null = null;

    formatTime(ms: number): string {
        return `0:${Math.ceil(ms / 1000)
            .toString()
            .padStart(2, '0')}`;
    }
}
