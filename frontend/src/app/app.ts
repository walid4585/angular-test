import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardLayoutService } from './layout/dashboard-layout.service';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { ToastComponent } from './layout/toast/toast';
import { ToastService } from './shared/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Header,ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly layout = inject(DashboardLayoutService);
  readonly sidebarCollapsed = this.layout.sidebarCollapsed;
  readonly mobileSidebarOpen = this.layout.mobileSidebarOpen;
  protected readonly toast = inject(ToastService);
 
}
