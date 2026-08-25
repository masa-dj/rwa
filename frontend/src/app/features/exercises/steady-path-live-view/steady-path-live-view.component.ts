import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteadyPathTelemetrySnapshot } from '../steady-path/steady-path.component';

@Component({
  selector: 'app-steady-path-live-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './steady-path-live-view.component.html',
  styleUrls: ['./steady-path-live-view.component.scss'],
})
export class SteadyPathLiveViewComponent {
  @Input() snapshot: SteadyPathTelemetrySnapshot | null = null;

  formatTime(ms: number): string {
    return `0:${Math.ceil(ms / 1000).toString().padStart(2, '0')}`;
  }
}
