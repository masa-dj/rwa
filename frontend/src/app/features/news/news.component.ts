import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';

interface NewsPost {
  id: string;
  title: string;
  body: string;
  author: string;
  postedAt: string;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
  // TODO: fetch from backend once /news endpoint exists
  posts: NewsPost[] = [
    {
      id: '1',
      title: 'Welcome to the platform',
      body: 'This is a placeholder announcement. Once the news feature is wired up to the backend, real posts from supervisors will show up here.',
      author: 'Test Supervizor',
      postedAt: new Date().toISOString(),
    },
  ];
}
