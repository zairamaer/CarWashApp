import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from 'src/app/services/appointment.service';
import { CustomerService } from 'src/app/services/customer.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Subscription, forkJoin } from 'rxjs';

// Define interfaces for type safety
interface Customer {
  id?: number;
  name: string;
  email: string;
  phone?: string;
}

interface ServiceType {
  serviceTypeName: string;
}

interface ServiceRate {
  vehicleSize?: string;
  price: number;
}

interface Appointment {
  id?: number;
  customer: Customer;
  service_type: ServiceType;
  service_rate: ServiceRate;
  appointmentDateTime: string | Date;
  datetime?: string | Date; // Alternative field name
  status: string;
  notes: string;
}

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AppointmentListComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  allCustomers: any[] = []; // All customers from CustomerService
  selectedCustomer: Customer | null = null;
  searchTerm: string = '';
  filteredCustomers: Customer[] = [];
  isLoading = false;
  
  private subscription = new Subscription();

  constructor(
    private appointmentService: AppointmentService,
    private customerService: CustomerService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Load all data - both appointments and customers
  async loadData(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Loading customer history...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    try {
      // Method 1: Try to get customers with appointments from CustomerService
      const customerSub = this.customerService.getCustomersWithAppointments().subscribe({
        next: (customers) => {
          console.log('Customers with appointments from CustomerService:', customers);
          this.allCustomers = customers;
          this.processCustomerAppointments(customers);
          this.isLoading = false;
          loading.dismiss();
        },
        error: (error) => {
          console.log('CustomerService method failed, trying alternative approach...', error);
          // Fallback to getting all customers and all appointments separately
          this.loadDataAlternativeMethod(loading);
        }
      });

      this.subscription.add(customerSub);

    } catch (error) {
      console.error('Error in loadData:', error);
      this.loadDataAlternativeMethod(loading);
    }
  }

  // Alternative method: Get all customers and all appointments separately
  private async loadDataAlternativeMethod(loading: HTMLIonLoadingElement): Promise<void> {
    try {
      // Get all appointments and all customers in parallel
      const appointmentSub = forkJoin({
        appointments: this.appointmentService.getAppointments(),
        customers: this.customerService.getCustomers(1, 1000) // Get all customers
      }).subscribe({
        next: ({ appointments, customers }) => {
          console.log('All appointments:', appointments);
          console.log('All customers:', customers);

          this.appointments = this.filterCompletedAppointments(appointments);
          this.allCustomers = customers.data || customers;
          
          // Process and combine the data
          this.combineCustomerAndAppointmentData();
          this.loadCustomers();
          
          this.isLoading = false;
          loading.dismiss();
        },
        error: async (error) => {
          console.error('Error loading data (alternative method):', error);
          this.isLoading = false;
          loading.dismiss();
          
          const toast = await this.toastController.create({
            message: 'Failed to load customer history. Please try again.',
            duration: 3000,
            color: 'danger',
            position: 'bottom'
          });
          toast.present();
        }
      });

      this.subscription.add(appointmentSub);

    } catch (error) {
      console.error('Error in alternative method:', error);
      this.isLoading = false;
      loading.dismiss();
    }
  }

  // Process customers that already have appointments included
  private processCustomerAppointments(customers: any[]): void {
    const allAppointments: Appointment[] = [];
    
    customers.forEach(customer => {
      if (customer.appointments && customer.appointments.length > 0) {
        // Filter only completed appointments for each customer
        const completedAppointments = customer.appointments.filter(
          (apt: any) => apt.status && apt.status.toLowerCase() === 'completed'
        );
        
        // Transform appointments to include customer info
        completedAppointments.forEach((apt: any) => {
          allAppointments.push({
            ...apt,
            customer: {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone
            },
            appointmentDateTime: apt.datetime || apt.appointmentDateTime
          });
        });
      }
    });

    this.appointments = allAppointments;
    this.loadCustomers();
  }

  // Combine customer and appointment data when fetched separately
  private combineCustomerAndAppointmentData(): void {
    // Add customer details to appointments
    this.appointments = this.appointments.map(appointment => {
      // Try to find full customer details
      const fullCustomer = this.allCustomers.find(customer => 
        customer.email === appointment.customer.email ||
        customer.id === appointment.customer.id
      );

      if (fullCustomer) {
        appointment.customer = {
          id: fullCustomer.id,
          name: fullCustomer.name,
          email: fullCustomer.email,
          phone: fullCustomer.phone
        };
      }

      return appointment;
    });
  }

  // Filter only completed appointments
  private filterCompletedAppointments(appointments: any[]): Appointment[] {
    return appointments.filter((appointment: any) => 
      appointment.status && appointment.status.toLowerCase() === 'completed'
    ).map((apt: any) => ({
      ...apt,
      appointmentDateTime: apt.datetime || apt.appointmentDateTime || apt.appointment_date
    }));
  }

  // Load appointments from service (original method as backup)
  loadAppointments(): void {
    const appointmentSub = this.appointmentService.getAppointments().subscribe({
      next: (data: Appointment[]) => {
        console.log('Fetched appointments:', data);

        // Keep only completed appointments
        this.appointments = this.filterCompletedAppointments(data);
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });

    this.subscription.add(appointmentSub);
  }

  // Get unique customers from appointments
  get customers(): Customer[] {
    const uniqueCustomers = new Map<string, Customer>();

    this.appointments.forEach((appointment: Appointment) => {
      const customerKey = appointment.customer.email || appointment.customer.id?.toString() || '';
      
      if (customerKey && !uniqueCustomers.has(customerKey)) {
        uniqueCustomers.set(customerKey, {
          id: appointment.customer.id,
          name: appointment.customer.name,
          email: appointment.customer.email,
          phone: appointment.customer.phone
        });
      }
    });

    const customerArray = Array.from(uniqueCustomers.values());
    console.log('Unique customers extracted:', customerArray);
    return customerArray;
  }

  loadCustomers(): void {
    this.filteredCustomers = this.customers;
    console.log('Filtered customers loaded:', this.filteredCustomers);
  }

  // Filter customers based on search term
  filterCustomers(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.filteredCustomers = this.customers;
    } else {
      this.filteredCustomers = this.customers.filter((customer: Customer) =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm))
      );
    }
  }

  // Select a customer to view their appointments
  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    console.log('Selected customer:', customer);
    console.log('Customer appointments:', this.getCustomerAppointments(customer.email));
  }

  // Go back to customer list
  goBack(): void {
    this.selectedCustomer = null;
  }

  // Get initials for avatar
  getInitials(name: string): string {
    if (!name) return '?';
    
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Get appointment count for a customer
  getAppointmentCount(email: string): number {
    const count = this.appointments.filter((appointment: Appointment) => 
      appointment.customer.email === email
    ).length;
    
    console.log(`Appointment count for ${email}: ${count}`);
    return count;
  }

  // Get all appointments for a specific customer
  getCustomerAppointments(email: string): Appointment[] {
    const customerAppointments = this.appointments.filter((appointment: Appointment) => 
      appointment.customer.email === email
    ).sort((a: Appointment, b: Appointment) => {
      const dateA = new Date(a.appointmentDateTime || a.datetime || 0).getTime();
      const dateB = new Date(b.appointmentDateTime || b.datetime || 0).getTime();
      return dateB - dateA; // Most recent first
    });

    console.log(`Appointments for ${email}:`, customerAppointments);
    return customerAppointments;
  }

  // Format date for display
  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format price for display
  formatPrice(price: number): string {
    return `₱${price.toFixed(2)}`;
  }

  // Refresh data
  async refreshData(): Promise<void> {
    await this.loadData();
  }

  // Manual debug method to check data
  debugData(): void {
    console.log('=== DEBUG DATA ===');
    console.log('All appointments:', this.appointments);
    console.log('All customers from service:', this.allCustomers);
    console.log('Unique customers:', this.customers);
    console.log('Filtered customers:', this.filteredCustomers);
    console.log('==================');
  }
}