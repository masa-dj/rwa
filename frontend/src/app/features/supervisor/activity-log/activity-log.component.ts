import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresenceService } from '../../../core/services/presence.service';
import { PresenceUser } from '../../../core/models/app.models';
import { Observable, map } from 'rxjs';

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
        this.users$ = this.presenceService.presenceList$.pipe(
            map((users) => {
                const now = Date.now();
                const twentyFourHoursMs = 24 * 60 * 60 * 1000;

                return users
                    .filter((user) => {
                        if (!user.lastSeenAt) return false;
                        const lastSeenTime = new Date(
                            user.lastSeenAt
                        ).getTime();
                        return now - lastSeenTime <= twentyFourHoursMs;
                    })
                    .sort((a, b) => {
                        const timeA = new Date(a.lastSeenAt!).getTime();
                        const timeB = new Date(b.lastSeenAt!).getTime();
                        return timeB - timeA;
                    });
            })
        );
    }

    timeAgo(date: string | null): string {
        if (!date) return 'Never';
        const seconds = Math.floor(
            (Date.now() - new Date(date).getTime()) / 1000
        );
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    }
}
