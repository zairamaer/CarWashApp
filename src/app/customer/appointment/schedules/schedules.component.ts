import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppointmentService } from '../../../services/appointment.service';
import { CustomerService } from '../../../services/customer.service'; // Add this import
import { LoadingController, ToastController, AlertController } from '@ionic/angular';

interface ServiceType {
  serviceTypeID: number;
  serviceTypeName: string;
  serviceTypeDescription: string;
  serviceTypeImage: string;
  created_at?: string;
  updated_at?: string;
}

interface VehicleSize {
  vehicleSizeCode: string;
  vehicleSizeDescription: string;
  created_at?: string;
  updated_at?: string;
}

interface ServiceRate {
  serviceRateID: number;
  vehicleSizeCode: string;
  serviceTypeID: number;
  price: string;
  created_at?: string;
  updated_at?: string;
  service_type: ServiceType;
  vehicle_size: VehicleSize;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
}

// Updated interface to match your actual API response
interface Appointment {
  id: number;
  service_rate_id: number;
  datetime: string;
  status: string;
  notes?: string;
  service_rate: ServiceRate; // Now includes full service rate data
  created_at?: string;
  updated_at?: string;
}

// Updated Customer interface to match API response
interface CustomerWithAppointments {
  id: number;
  name: string;
  email: string;
  phone: string;
  appointments: Appointment[];
}

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SchedulesComponent implements OnInit {
  appointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  isLoading = false;
  currentDate = new Date();
  
  // Add customer properties
  currentCustomer: CustomerWithAppointments | null = null;
  customerId: number | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private customerService: CustomerService, // Inject CustomerService
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initializeCustomer();
  }

  initializeCustomer() {
    // Get customer ID from localStorage via CustomerService
    this.customerId = this.customerService.getCurrentUserId();
    
    if (this.customerId) {
      this.loadCustomerSchedules();
    } else {
      this.showLoginRequiredMessage();
    }
  }

  async showLoginRequiredMessage() {
    const toast = await this.toastController.create({
      message: 'Please log in to view your appointments',
      duration: 3000,
      color: 'warning',
      position: 'bottom'
    });
    toast.present();
  }

  async loadCustomerSchedules() {
    if (!this.customerId) {
      console.error('No customer ID available');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Loading your scheduled appointments...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    try {
      this.customerService.getCustomerById(this.customerId).subscribe({
        next: (customer: CustomerWithAppointments) => {
          this.currentCustomer = customer;
          this.appointments = customer.appointments || [];
          this.filterUpcomingAppointments();
          this.isLoading = false;
          loading.dismiss();
        },
        error: async (error) => {
          console.error('Error loading customer schedules:', error);
          this.isLoading = false;
          loading.dismiss();
          
          const toast = await this.toastController.create({
            message: 'Failed to load your appointments. Please try again.',
            duration: 3000,
            color: 'danger',
            position: 'bottom'
          });
          toast.present();
        }
      });
    } catch (error) {
      console.error('Error loading customer schedules:', error);
      this.isLoading = false;
      loading.dismiss();
    }
  }

  filterUpcomingAppointments() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Filter appointments that are ONLY confirmed and in the future
    this.upcomingAppointments = this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.datetime); // Updated field name
      const isUpcoming = appointmentDate >= now;
      const isConfirmed = appointment.status.toLowerCase() === 'confirmed';
      return isUpcoming && isConfirmed;
    }).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    // Filter today's appointments (only confirmed)
    this.todayAppointments = this.upcomingAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.datetime);
      const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
      return appointmentDay.getTime() === today.getTime();
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'tertiary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'in-progress':
        return 'play-circle';
      case 'completed':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  }

  getTodayNextAppointment(): string {
    if (this.todayAppointments.length === 0) return '';

    // Sort today's appointments by time
    const sorted = [...this.todayAppointments].sort(
      (a, b) =>
        new Date(a.datetime).getTime() -
        new Date(b.datetime).getTime()
    );

    return this.formatTime(sorted[0].datetime);
  }

  getNextAppointmentDate(): string {
    if (this.upcomingAppointments.length === 0) return '';

    // Sort upcoming appointments by datetime
    const sorted = [...this.upcomingAppointments].sort(
      (a, b) =>
        new Date(a.datetime).getTime() -
        new Date(b.datetime).getTime()
    );

    const nextAppointment = sorted[0];
    return `${this.formatDate(nextAppointment.datetime)} at ${this.formatTime(nextAppointment.datetime)}`;
  }

  getPriorityColor(appointmentDateTime: string): string {
    const appointmentDate = new Date(appointmentDateTime);
    const now = new Date();
    const diffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 2) return 'danger';  // Less than 2 hours
    if (diffHours <= 24) return 'warning'; // Less than 24 hours
    return 'success'; // More than 24 hours
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (this.isSameDay(date, today)) {
      return 'Today';
    } else if (this.isSameDay(date, tomorrow)) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatPrice(price: string): string {
    return `₱${parseFloat(price).toFixed(2)}`;
  }

  getTimeUntil(dateString: string): string {
    const appointmentDate = new Date(dateString);
    const now = new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) return 'Overdue';
    if (diffHours < 1) return `in ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `in ${diffHours}h ${diffMins}m`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  async refreshSchedules(event?: any) {
    await this.loadCustomerSchedules();
    if (event) {
      event.target.complete();
    }
  }

  trackByAppointmentId(index: number, appointment: Appointment): number {
    return appointment.id;
  }

  // Helper method to get customer info
  getCustomerName(): string {
    // First try to get from current customer data, then fallback to localStorage
    if (this.currentCustomer) {
      return this.currentCustomer.name;
    }
    
    const nameFromStorage = this.customerService.getCurrentUserName();
    return nameFromStorage || 'Customer';
  }

  // Helper method to refresh customer data (useful for login/logout)
  refreshCustomerData() {
    this.initializeCustomer();
  }

  // Helper method to check if user is logged in
  isLoggedIn(): boolean {
    return this.customerId !== null;
  }
}