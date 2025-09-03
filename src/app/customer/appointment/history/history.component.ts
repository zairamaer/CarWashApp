import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppointmentService } from '../../../services/appointment.service';
import { CustomerService } from '../../../services/customer.service'; // Add CustomerService import
import { LoadingController, ToastController } from '@ionic/angular';

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

// Updated interface to match the API response structure
interface Appointment {
  id: number; // Updated from appointmentID
  service_rate_id: number; // Updated from serviceRateID
  datetime: string; // Updated from appointmentDateTime
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
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HistoryComponent implements OnInit {
  appointments: Appointment[] = [];
  completedAppointments: Appointment[] = [];
  isLoading = false;
  
  // Add customer properties
  currentCustomer: CustomerWithAppointments | null = null;
  customerId: number | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private customerService: CustomerService, // Inject CustomerService
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initializeCustomer();
  }

  initializeCustomer() {
    // Get customer ID from localStorage via CustomerService
    this.customerId = this.customerService.getCurrentUserId();
    
    if (this.customerId) {
      console.log('Current customer ID from localStorage:', this.customerId);
      this.loadCustomerHistory();
    } else {
      this.showLoginRequiredMessage();
    }
  }

  async showLoginRequiredMessage() {
    const toast = await this.toastController.create({
      message: 'Please log in to view your appointment history',
      duration: 3000,
      color: 'warning',
      position: 'bottom'
    });
    toast.present();
  }

  async loadCustomerHistory() {
    if (!this.customerId) {
      console.error('No customer ID available');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Loading your appointment history...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    this.customerService.getCurrentCustomerAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        this.appointments = appointments;
        this.completedAppointments = this.appointments
          .filter(appt => appt.status.toLowerCase() === 'completed')
          .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

        this.isLoading = false;
        loading.dismiss();
      },
      error: async (error) => {
        console.error('Error loading customer appointments:', error);
        this.isLoading = false;
        loading.dismiss();

        const toast = await this.toastController.create({
          message: 'Failed to load your appointment history. Please try again.',
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
        toast.present();
      }
    });
  }


  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'primary';
      case 'cancelled':
        return 'danger';
      case 'in-progress':
        return 'tertiary';
      default:
        return 'medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'confirmed':
        return 'checkmark';
      case 'cancelled':
        return 'close-circle';
      case 'in-progress':
        return 'play-circle';
      default:
        return 'help-circle';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
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

  async refreshHistory(event?: any) {
    await this.loadCustomerHistory();
    if (event) {
      event.target.complete();
    }
  }

  trackByAppointmentId(index: number, appointment: Appointment): number {
    return appointment.id;
  }

  // Helper method to get customer info
  getCustomerName(): string {
    if (this.currentCustomer) {
      return this.currentCustomer.name;
    }
    
    const nameFromStorage = this.customerService.getCurrentUserName();
    return nameFromStorage || 'Customer';
  }

  // Helper method to check if user is logged in
  isLoggedIn(): boolean {
    return this.customerId !== null;
  }

  // Helper method to refresh customer data
  refreshCustomerData() {
    this.initializeCustomer();
  }

  // Calculate total spent on completed services
  getTotalSpent(): number {
    return this.completedAppointments.reduce((total, appointment) => {
      return total + parseFloat(appointment.service_rate.price || '0');
    }, 0);
  }

  // Get most frequent service
  getMostFrequentService(): string {
    if (this.completedAppointments.length === 0) return 'None';
    
    const serviceCounts = this.completedAppointments.reduce((counts, appointment) => {
      const serviceName = appointment.service_rate.service_type.serviceTypeName;
      counts[serviceName] = (counts[serviceName] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });
    
    return Object.keys(serviceCounts).reduce((a, b) => 
      serviceCounts[a] > serviceCounts[b] ? a : b
    );
  }
}