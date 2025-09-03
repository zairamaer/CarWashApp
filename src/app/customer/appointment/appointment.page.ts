import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HistoryComponent } from './history/history.component';
import { HomeSidebarComponent } from '../../component/home-sidebar/home-sidebar.component';
import { HomeHeaderComponent } from '../../component/home-header/home-header.component';
import { ScreenSizeService } from '../../services/screen-size.service';
import { SchedulesComponent } from './schedules/schedules.component';
import { AppointmentService } from '../../services/appointment.service';
import { CustomerService } from '../../services/customer.service';
import { Subscription, interval } from 'rxjs';

interface AppointmentStats {
  scheduled: number;
  history: number;
}

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    HistoryComponent, 
    HomeSidebarComponent, 
    HomeHeaderComponent, 
    SchedulesComponent
  ]
})
export class AppointmentPage implements OnInit, OnDestroy {
  selectedView: 'scheduled' | 'history' = 'scheduled';
  contentLoaded = false;
  stats: AppointmentStats = {
    scheduled: 0,
    history: 0
  };
  
  private subscription = new Subscription();
  
  // Auto-refresh properties
  private userCheckInterval: Subscription | null = null;
  private lastKnownUserId: number | null = null;
  private autoRefreshInterval: Subscription | null = null;
  private readonly CHECK_INTERVAL = 1000; // Check every second for user changes
  private readonly AUTO_REFRESH_INTERVAL = 1000; // Auto-refresh stats every 30 seconds

  constructor(
    public screenSizeService: ScreenSizeService,
    private appointmentService: AppointmentService,
    private customerService: CustomerService
  ) {}

  ngOnInit() {
    this.initializeUser();
    this.startUserMonitoring();
    this.startAutoRefresh();
    this.contentLoaded = true;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopUserMonitoring();
    this.stopAutoRefresh();
  }

  // Initialize user and load stats
  private initializeUser() {
    this.lastKnownUserId = this.customerService.getCurrentUserId();
    if (this.lastKnownUserId) {
      this.loadStats();
    } else {
      this.clearStats();
    }
  }

  // Start monitoring for user changes
  private startUserMonitoring() {
    this.userCheckInterval = interval(this.CHECK_INTERVAL).subscribe(() => {
      const currentUserId = this.customerService.getCurrentUserId();
      
      // Check if user has changed (login, logout, or switched users)
      if (currentUserId !== this.lastKnownUserId) {
        this.handleUserChange(currentUserId);
        this.lastKnownUserId = currentUserId;
      }
    });
  }

  // Stop user monitoring
  private stopUserMonitoring() {
    if (this.userCheckInterval) {
      this.userCheckInterval.unsubscribe();
      this.userCheckInterval = null;
    }
  }

  // Start auto-refresh for stats
  private startAutoRefresh() {
    this.autoRefreshInterval = interval(this.AUTO_REFRESH_INTERVAL).subscribe(() => {
      // Only auto-refresh if user is logged in
      if (this.customerService.getCurrentUserId()) {
        this.loadStats(true); // Silent refresh
      }
    });
  }

  // Stop auto-refresh
  private stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      this.autoRefreshInterval.unsubscribe();
      this.autoRefreshInterval = null;
    }
  }

  // Handle user change event
  private handleUserChange(newUserId: number | null) {
    if (newUserId) {
      // User logged in or switched - load new stats
      this.loadStats();
    } else {
      // User logged out - clear stats
      this.clearStats();
    }
  }

  // Clear stats when user logs out
  private clearStats() {
    this.stats = {
      scheduled: 0,
      history: 0
    };
  }

  setActiveView(view: 'scheduled' | 'history') {
    if (this.selectedView !== view) {
      this.contentLoaded = false;
      this.selectedView = view;
      
      // Add slight delay for smooth transition
      setTimeout(() => {
        this.contentLoaded = true;
      }, 150);
    }
  }

  getSectionTitle(): string {
    switch (this.selectedView) {
      case 'scheduled':
        return 'Scheduled';
      case 'history':
        return 'History';
      default:
        return 'Appointments';
    }
  }

  getStatCount(type: 'scheduled' | 'history'): number {
    return this.stats[type];
  }

  private loadStats(silentRefresh: boolean = false) {
    const currentUserId = this.customerService.getCurrentUserId();
    
    if (!currentUserId) {
      if (!silentRefresh) {
        console.log('No user logged in, clearing stats');
      }
      this.clearStats();
      return;
    }

    const appointmentSub = this.customerService.getCurrentCustomerAppointments().subscribe({
      next: (appointments) => {
        this.calculateStats(appointments);
        
        if (!silentRefresh) {
          
        }
      },
      error: (error) => {
        console.error('Error loading appointment stats:', error);
        
        // On error, don't clear existing stats during silent refresh
        if (!silentRefresh) {
          this.clearStats();
        }
      }
    });

    this.subscription.add(appointmentSub);
  }

  private calculateStats(appointments: any[]) {
    this.stats = {
      // Count confirmed appointments (both past and future)
      scheduled: appointments.filter(
        apt => apt.status.toLowerCase() === 'confirmed'
      ).length,

      // Count completed appointments
      history: appointments.filter(
        apt => apt.status.toLowerCase() === 'completed'
      ).length
    };
  }

  // Method to refresh stats when child components update
  refreshStats() {
    this.loadStats();
  }

  // Manual refresh method
  manualRefresh() {
    if (this.customerService.getCurrentUserId()) {
      this.loadStats();
    } else {
      this.initializeUser();
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.customerService.getCurrentUserId() !== null;
  }

  // Get current user name (useful for debugging or display)
  getCurrentUserName(): string {
    return this.customerService.getCurrentUserName() || 'Guest';
  }

  // Method to get auto-refresh status (useful for debugging)
  getAutoRefreshStatus(): string {
    return this.autoRefreshInterval ? 'Active' : 'Inactive';
  }

  // Method to toggle auto-refresh (optional feature)
  toggleAutoRefresh() {
    if (this.autoRefreshInterval) {
      this.stopAutoRefresh();
    } else {
      this.startAutoRefresh();
    }
  }
}