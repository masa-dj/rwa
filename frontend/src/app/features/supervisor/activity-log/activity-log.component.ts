import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresenceService, PresenceUser } from '../../../core/services/presence.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
})
export class ActivityLogComponent implements OnInit {
  users$!: Observable<PresenceUser[]>;

  constructor(private presenceService: PresenceService) {}

  ngOnInit() {
    this.users$ = this.presenceService.presenceList$;
  }

  timeAgo(date: string | null): string {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
