import { Component, inject } from '@angular/core';
import { DashboardLayoutService } from '../dashboard-layout.service';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  private readonly layout = inject(DashboardLayoutService);

  readonly pageTitle = this.layout.pageTitle;
  readonly searchTerm = this.layout.searchTerm;
  readonly darkTheme = this.layout.darkTheme;

  onSearch(event: Event): void {
    this.layout.setSearchTerm((event.target as HTMLInputElement).value);
  }

  toggleTheme(): void {
    this.layout.toggleTheme();
  }

  toggleMobileSidebar(): void {
    this.layout.toggleMobileSidebar();
  }
}
