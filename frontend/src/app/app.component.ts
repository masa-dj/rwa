import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PresenceService } from './core/services/presence.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  constructor(private presenceService: PresenceService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.presenceService.connect(token);
    }
  }
}
