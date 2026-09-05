import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardLayoutService } from '../../layout/dashboard-layout.service';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon';

@Component({
  selector: 'app-dashboard-placeholder',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './dashboard-placeholder.html',
  styleUrls: ['./dashboard-placeholder.css'],
})
export class DashboardPlaceholderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly layout = inject(DashboardLayoutService);

  title = 'Coming Soon';
  description = 'This feature is under development.';

  ngOnInit(): void {
    const routeTitle = this.route.snapshot.data['title'] as string | undefined;
    const routeDescription = this.route.snapshot.data['description'] as string | undefined;
    const fallbackTitle = this.formatTitle(this.route.snapshot.routeConfig?.path ?? '');

    this.title = routeTitle ?? fallbackTitle;
    this.description = routeDescription ?? 'This feature is under development.';
    this.layout.setPageTitle(this.title);
  }

  private formatTitle(path: string): string {
    if (!path) {
      return 'Coming Soon';
    }

    return path
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
