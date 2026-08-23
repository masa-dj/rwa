import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { Exam } from '../../../core/services/exam.service';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  fullDate: Date;
  exams: Exam[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() exams: Exam[] = [];

  viewDate = new Date();
  weeks: CalendarDay[][] = [];
  weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  exerciseLabels: Record<string, string> = {
    steady_path: 'Steady Path',
    timed_suture: 'Timed Suture',
    vessel_cauterization: 'Vessel Cauterization',
  };

  ngOnInit() {
    this.buildCalendar();
  }

  ngOnChanges() {
    this.buildCalendar();
  }

  get monthLabel(): string {
    return this.viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  prevMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.buildCalendar();
  }

  formatTime(scheduledAt: string): string {
    return new Date(scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  private buildCalendar() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const startDate = new Date(year, month, 1 - startOffset);
    const today = new Date();

    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      days.push({
        date: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
        isToday: d.toDateString() === today.toDateString(),
        fullDate: d,
        exams: this.exams.filter((e) => new Date(e.scheduledAt).toDateString() === d.toDateString()),
      });
    }

    this.weeks = [];
    for (let i = 0; i < 6; i++) {
      this.weeks.push(days.slice(i * 7, i * 7 + 7));
    }
  }
}
