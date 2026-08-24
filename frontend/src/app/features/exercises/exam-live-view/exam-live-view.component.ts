import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetrySnapshot } from '../vessel-cauterization/vessel-cauterization.component';

@Component({
  selector: 'app-exam-live-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-live-view.component.html',
  styleUrls: ['./exam-live-view.component.scss'],
})
export class ExamLiveViewComponent {
  @Input() snapshot: TelemetrySnapshot | null = null;

  formatTime(ms: number): string {
    return `0:${Math.ceil(ms / 1000).toString().padStart(2, '0')}`;
  }
}
