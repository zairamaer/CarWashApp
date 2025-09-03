import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { DashboardService, DashboardStats, DashboardData } from '../../services/dashboard.service';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription, interval, of, forkJoin } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

interface UpcomingAppointment {
  appointmentID: number;
  customerName: string;
  serviceName: string;
  vehicleType: string;
  time: string;
  date: string;
  status: string;
  price: number;
  appointmentDateTime: string;
}

interface RecentActivity {
  id: number;
  type: string;
  icon: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, AdminSidebarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Dashboard stats
  todaysBookings = 0;
  todaysRevenue = 0;
  totalCustomers = 0;
  totalServices = 0;

  // Growth percentages / counts
  bookingGrowth = 0;
  revenueGrowth = 0;
  newCustomersThisWeek = 0;

  // Data arrays
  upcomingAppointments: UpcomingAppointment[] = [];
  recentActivities: RecentActivity[] = [];

  // Loading states
  isLoading = true;
  isLoadingStats = true;
  isLoadingAppointments = true;

  // Error states
  hasError = false;
  errorMessage = '';

  // Subscriptions
  private subscriptions: Subscription[] = [];
  private refreshSubscription?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.refreshSubscription?.unsubscribe();
  }

  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.isLoadingStats = true;
    this.isLoadingAppointments = true;
    this.hasError = false;

    // ✅ Load dashboard data AND customer stats simultaneously
    const subscription = forkJoin({
      dashboardData: this.dashboardService.getDashboardDataSafe(),
      customerStats: this.customerService.getCustomerStats()
    }).subscribe({
      next: (result) => {
        try {
          // Update dashboard stats
          const data = result.dashboardData;
          this.updateStatsFromData(data.stats);

          // ✅ Update customer stats from CustomerService
          this.totalCustomers = result.customerStats.totalCustomers;
          this.newCustomersThisWeek = result.customerStats.newCustomersThisWeek;

          // Update appointments and activities
          this.upcomingAppointments = data.upcomingAppointments;
          this.recentActivities = data.recentActivities;

          console.log('Dashboard loaded successfully:', {
            totalCustomers: this.totalCustomers,
            newCustomersThisWeek: this.newCustomersThisWeek,
            todaysBookings: this.todaysBookings,
            todaysRevenue: this.todaysRevenue
          });

          this.isLoading = false;
          this.isLoadingStats = false;
          this.isLoadingAppointments = false;
        } catch (error) {
          console.error('Error processing dashboard data:', error);
          this.handleError('Failed to process dashboard data');
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.handleError('Failed to load dashboard data. Please try again.');
      }
    });

    this.subscriptions.push(subscription);
  }

  private updateStatsFromData(stats: DashboardStats): void {
    this.todaysBookings = stats.todaysBookings;
    this.todaysRevenue = stats.todaysRevenue;
    this.totalServices = stats.totalServices;

    const growth = this.dashboardService.getGrowthIndicators(stats);
    this.bookingGrowth = growth.bookingGrowth;
    this.revenueGrowth = growth.revenueGrowth;
    // Note: totalCustomers and newCustomersThisWeek are handled separately
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.isLoading = false;
    this.isLoadingStats = false;
    this.isLoadingAppointments = false;
  }

  private startAutoRefresh(): void {
    this.refreshSubscription = interval(5 * 60 * 1000).pipe(
      switchMap(() => 
        forkJoin({
          dashboardData: this.dashboardService.refreshDashboard().pipe(
            catchError(err => {
              console.warn('Dashboard auto-refresh failed:', err);
              return of(null);
            })
          ),
          customerStats: this.customerService.getCustomerStats().pipe(
            catchError(err => {
              console.warn('Customer stats auto-refresh failed:', err);
              return of(null);
            })
          )
        })
      )
    ).subscribe({
      next: (result) => {
        if (result.dashboardData) {
          this.updateStatsFromData(result.dashboardData.stats);
          this.upcomingAppointments = result.dashboardData.upcomingAppointments;
          this.recentActivities = result.dashboardData.recentActivities;
        }

        if (result.customerStats) {
          this.totalCustomers = result.customerStats.totalCustomers;
          this.newCustomersThisWeek = result.customerStats.newCustomersThisWeek;
        }

        console.log('Auto-refresh completed:', {
          totalCustomers: this.totalCustomers,
          newCustomersThisWeek: this.newCustomersThisWeek
        });
      },
      error: (error) => {
        console.warn('Auto-refresh failed:', error);
      }
    });
  }

  logout(): void {
    try {
      this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      this.router.navigate(['/login']);
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  // Helpers for template
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'booking': return 'calendar-outline';
      case 'payment': return 'cash-outline';
      case 'customer': return 'person-add-outline';
      case 'system': return 'information-circle-outline';
      default: return 'information-circle-outline';
    }
  }

  getGrowthIcon(value: number): string {
    if (value > 0) return 'trending-up-outline';
    if (value < 0) return 'trending-down-outline';
    return 'remove-outline';
  }

  getGrowthClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }

  getGrowthText(value: number, type: string): string {
    switch (type) {
      case 'bookings':
        return `${value > 0 ? '+' : ''}${value}% from yesterday`;
      case 'revenue':
        return `${value > 0 ? '+' : ''}${value}% from yesterday`;
      case 'customers':
        return value > 0 ? `+${value} new customers this week` : 'No new customers this week';
      default:
        return 'No changes';
    }
  }
}