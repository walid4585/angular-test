import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DashboardLayoutService } from '../dashboard-layout.service';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SvgIconComponent],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  private readonly layout = inject(DashboardLayoutService);

  readonly sidebarCollapsed = this.layout.sidebarCollapsed;
  readonly mobileSidebarOpen = this.layout.mobileSidebarOpen;
  readonly menuSearch = signal('');

  readonly sections: NavSection[] = [
    {
      title: 'Dashboard',
      icon: 'dashboard',
      items: [
        { label: 'Sales Overview', icon: 'dashboard', route: '/', exact: true },
        { label: 'Orders Stats', icon: 'chart', route: '/orders-stats' },
        { label: 'Revenue', icon: 'dollar', route: '/revenue' },
      ],
    },
    {
      title: 'Products',
      icon: 'tag',
      items: [
        { label: 'Add Product', icon: 'plus-circle', route: '/add-product' },
        { label: 'Edit Product', icon: 'edit', route: '/edit-product' },
        { label: 'Delete Product', icon: 'trash', route: '/delete-product' },
      ],
    },
    {
      title: 'Orders',
      icon: 'box',
      items: [
        { label: 'Add New Order', icon: 'bell', route: '/Add New Order' },
        { label: 'Processing', icon: 'clock', route: '/processing', badge: '5' },
        { label: 'Delivered', icon: 'check', route: '/delivered', badge: '89' },
      ],
    },
    {
      title: 'Work Types',
      icon: 'list',
      items: [
        { label: 'Work Types', icon: 'list', route: '/work-types' },
      ],
    },
    {
      title: 'Users',
      icon: 'users',
      items: [
        { label: 'Customer List', icon: 'users', route: '/customers' },
        { label: 'Workers List', icon: 'users', route: '/workers' },
      ],
    },
    {
      title: 'Payments',
      icon: 'card',
      items: [
        { label: 'Transactions', icon: 'exchange', route: '/transactions' },
        { label: 'Refunds', icon: 'undo', route: '/refunds' },
      ],
    },
    {
      title: 'Analytics',
      icon: 'chart',
      items: [
        { label: 'Sales Charts', icon: 'chart', route: '/sales-charts' },
        { label: 'Best Selling Products', icon: 'trophy', route: '/best-selling' },
      ],
    },
    {
      title: 'Settings',
      icon: 'gear',
      items: [
        { label: 'Store Info', icon: 'store', route: '/store-info' },
        { label: 'Shipping Settings', icon: 'truck', route: '/shipping' },
      ],
    },
  ];

  readonly filteredSections = computed(() => {
    const term = this.menuSearch().trim().toLowerCase();

    if (!term) {
      return this.sections;
    }

    return this.sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const searchText = `${section.title} ${item.label}`.toLowerCase();
          return searchText.includes(term);
        }),
      }))
      .filter((section) => section.items.length > 0);
  });

  toggleSidebar(): void {
    this.layout.toggleSidebar();
  }

  onSearch(event: Event): void {
    this.menuSearch.set((event.target as HTMLInputElement).value);
  }

  closeMobileSidebar(): void {
    this.layout.closeMobileSidebar();
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      alert('Logged out successfully!');
    }
  }

  trackSection(_: number, section: NavSection): string {
    return section.title;
  }

  trackItem(_: number, item: NavItem): string {
    return item.route;
  }
}
