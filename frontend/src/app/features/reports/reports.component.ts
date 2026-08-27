import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReportService, Report } from '../../core/services/report.service';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, SidebarComponent],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
    reports: Report[] = [];
    loading = true;

    constructor(private reportService: ReportService, private router: Router) {}

    ngOnInit() {
        this.reportService.getMine().subscribe({
            next: (reports) => {
                this.reports = reports;
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }

    open(report: Report) {
        this.router.navigate(['/reports', report.id]);
    }
}
