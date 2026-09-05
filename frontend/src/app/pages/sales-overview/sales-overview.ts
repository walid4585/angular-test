import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import type { Chart } from 'chart.js';

import { DashboardLayoutService } from '../../layout/dashboard-layout.service';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon';
import { CloudOrdersTableComponent } from '../../layout/CloudOrdersTable/cloudOrdersTable';
import { LocalOrdersTable } from '../../layout/local-orders-table/local-orders-table';

// ============================================
// ✅ Statistics Card Interface
// ============================================
interface StatCard {

  title: string;

  value: string;

  icon: string;

  trendIcon: string;

  trend: string;

}

@Component({
  selector: 'app-sales-overview',
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
    CloudOrdersTableComponent,
    LocalOrdersTable
  ],
  templateUrl: './sales-overview.html',
  styleUrls: ['./sales-overview.css'],
})

export class SalesOverview implements OnInit, AfterViewInit, OnDestroy {

  // ============================================
  // ✅ Active Orders Table
  // ============================================
  readonly activeTable = signal<'cloud' | 'local'>('local');

  // ============================================
  // ✅ Inject Services
  // ============================================
  private readonly layout = inject(DashboardLayoutService);

  private readonly platformId = inject(PLATFORM_ID);

  // ============================================
  // ✅ Charts
  // ============================================
  private revenueChart: Chart | null = null;

  private productsChart: Chart | null = null;

  @ViewChild('revenueChartCanvas')
  revenueChartCanvas?: ElementRef<HTMLCanvasElement>;

  @ViewChild('productsChartCanvas')
  productsChartCanvas?: ElementRef<HTMLCanvasElement>;

  // ============================================
  // ✅ Dashboard Statistics
  // ============================================
  readonly stats: StatCard[] = [

    {
      title: 'Total Revenue',
      value: '$48,293',
      icon: 'dollar',
      trendIcon: 'trend-up',
      trend: '+12.5% from last month',
    },

    {
      title: 'Total Orders',
      value: '1,284',
      icon: 'cart',
      trendIcon: 'trend-up',
      trend: '+8.2% from last month',
    },

    {
      title: 'Active Customers',
      value: '3,982',
      icon: 'users',
      trendIcon: 'trend-up',
      trend: '+15.3% from last month',
    },

    {
      title: 'Conversion Rate',
      value: '3.24%',
      icon: 'chart',
      trendIcon: 'trend-up',
      trend: '+0.8% from last month',
    },

  ];

  // ============================================
  // ✅ Component Initialization
  // ============================================
  ngOnInit(): void {

    this.layout.setPageTitle('Sales Overview');

  }

  // ============================================
  // ✅ Switch Between Tables
  // ============================================
  setTable(type: 'cloud' | 'local'): void {

    this.activeTable.set(type);

  }

  // ============================================
  // ✅ After View Initialization
  // ============================================
  ngAfterViewInit(): void {

    if (isPlatformBrowser(this.platformId)) {

      void this.initCharts();

    }

  }

  // ============================================
  // ✅ Destroy Charts
  // ============================================
  ngOnDestroy(): void {

    this.revenueChart?.destroy();

    this.productsChart?.destroy();

  }

  // ============================================
  // ✅ Track Statistics Cards
  // ============================================
  trackByStat(_: number, stat: StatCard): string {

    return stat.title;

  }

  // ============================================
  // ✅ Get Canvas Context
  // ============================================
  private getCanvasContext(
    canvasRef: ElementRef<HTMLCanvasElement> | undefined
  ): CanvasRenderingContext2D | null {

    if (!canvasRef) {

      return null;

    }

    try {

      return canvasRef.nativeElement.getContext('2d');

    } catch {

      return null;

    }

  }

  // ============================================
  // ✅ Initialize Charts
  // ============================================
  private async initCharts(): Promise<void> {

    const revenueCtx = this.getCanvasContext(this.revenueChartCanvas);

    const productsCtx = this.getCanvasContext(this.productsChartCanvas);

    if (!revenueCtx && !productsCtx) {

      return;

    }

    const { default: Chart } = await import('chart.js/auto');

    // ============================================
    // Revenue Chart
    // ============================================
    if (revenueCtx) {

      this.revenueChart?.destroy();

      this.revenueChart = new Chart(revenueCtx, {

        type: 'line',

        data: {

          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],

          datasets: [

            {

              label: 'Revenue',

              data: [12500, 15000, 18000, 2000, 28000, 35000],

              borderColor: '#a855f7',

              backgroundColor: 'rgba(168, 85, 247, 0.1)',

              fill: true,

              tension: 0.4,

            },

          ],

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

        },

      });

    }

    // ============================================
    // Products Chart
    // ============================================
    if (productsCtx) {

      this.productsChart?.destroy();

      this.productsChart = new Chart(productsCtx, {

        type: 'doughnut',

        data: {

          labels: [
            'T-Shirts',
            'Jeans',
            'Jackets',
            'Shoes',
            'Accessories'
          ],

          datasets: [

            {

              data: [10, 8, 34, 12, 5],

              backgroundColor: [
                '#a855f7',
                '#ec4899',
                '#f59e0b',
                '#10b981',
                '#06b6d4',
              ],

            },

          ],

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

        },

      });

    }

  }

}