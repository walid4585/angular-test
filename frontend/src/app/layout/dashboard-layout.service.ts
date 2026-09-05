import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DashboardLayoutService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);
  readonly darkTheme = signal(true);
  readonly searchTerm = signal('');
  readonly pageTitle = signal('Sales Overview');

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((value) => !value);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setPageTitle(value: string): void {
    if (this.pageTitle() === value) {
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      queueMicrotask(() => this.pageTitle.set(value));
      return;
    }

    this.pageTitle.set(value);
  }

  toggleTheme(): void {
    const nextIsDark = !this.darkTheme();
    this.darkTheme.set(nextIsDark);

    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      root.style.setProperty(
        '--glass-bg',
        nextIsDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.78)'
      );
      root.style.setProperty(
        '--glass-border',
        nextIsDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.14)'
      );
      root.style.setProperty('--text-primary', nextIsDark ? '#ffffff' : '#0f172a');
      root.style.setProperty('--text-secondary', nextIsDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(15, 23, 42, 0.72)');
    }
  }
}
