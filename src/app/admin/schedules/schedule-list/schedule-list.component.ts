import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppointmentService } from 'src/app/services/appointment.service';

// Define interfaces based on your API response

interface VehicleSize {
  vehicleSizeCode: string;
  vehicleSizeDescription: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
}

interface ServiceRate {
  vehicleSize: string;
  price: string;
}

interface ServiceType {
  serviceTypeID: number;
  serviceTypeName: string;
  serviceTypeDescription: string;
  serviceTypeImage?: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Appointment {
  appointmentID: number;
  customerID: number;
  serviceRateID: number;
  appointmentDateTime: string;
  status: string;
  notes: string | null;
  vehicle_size?: VehicleSize;
  customer: Customer;
  service_rate: ServiceRate;
  service_type: ServiceType;
  created_at: string;
  updated_at: string;
}

interface CustomerGroup {
  customer: Customer;
  appointments: Appointment[];
  upcomingCount: number;
  nextAppointmentDate: Date | null;
  totalAppointments: number;
}

@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
  standalone: true
})
export class ScheduleListComponent implements OnInit {
  // Data properties
  appointments: Appointment[] = [];
  customerGroups: CustomerGroup[] = [];
  filteredCustomers: CustomerGroup[] = [];
  selectedCustomer: CustomerGroup | null = null;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;
  
  // Filters and search
  searchTerm: string = '';
  sortBy: string = 'nextAppointment'; // 'nextAppointment', 'name', 'totalAppointments'
  
  // Appointment filters for detail view
  appointmentFilter: string = 'all'; // 'all', 'today', 'week', 'month'
  appointmentStatusFilter: string = 'all'; // 'all', 'confirmed', 'completed'
  
  // Loading state
  loading: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  // TrackBy function for Angular optimization
  trackByCustomerEmail(index: number, customerGroup: CustomerGroup): string {
    return customerGroup.customer.email;
  }

  // Load appointments from API and group by customer
  loadAppointments(): void {
    this.loading = true;

    this.appointmentService.getAppointments().subscribe({
      next: (data: Appointment[]) => {
        console.log('Fetched Appointments:', data);

        // Filter out pending appointments
        this.appointments = data.filter(
          (appt) =>
            appt.status.toLowerCase() === 'confirmed' ||
            appt.status.toLowerCase() === 'completed'
        );

        // Group appointments by customer
        this.groupAppointmentsByCustomer();
        this.filterCustomers();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading appointments:', error);
        this.presentErrorToast('Error loading appointments');
        this.loading = false;
      }
    });
  }

  // Group appointments by customer email
  private groupAppointmentsByCustomer(): void {
    const customerMap = new Map<string, CustomerGroup>();
    
    this.appointments.forEach(appointment => {
      const customerEmail = appointment.customer.email;
      
      if (!customerMap.has(customerEmail)) {
        customerMap.set(customerEmail, {
          customer: appointment.customer,
          appointments: [],
          upcomingCount: 0,
          nextAppointmentDate: null,
          totalAppointments: 0
        });
      }
      
      const customerGroup = customerMap.get(customerEmail)!;
      customerGroup.appointments.push(appointment);
    });

    // Calculate stats for each customer group
    this.customerGroups = Array.from(customerMap.values()).map(group => {
      // Sort appointments by date (newest first for display, but we need upcoming for stats)
      group.appointments.sort((a, b) => 
        new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime()
      );
      
      const now = new Date();
      const upcomingAppointments = group.appointments.filter(
        appt => new Date(appt.appointmentDateTime) > now && appt.status.toLowerCase() === 'confirmed'
      );
      
      group.upcomingCount = upcomingAppointments.length;
      group.totalAppointments = group.appointments.length;
      
      // Get the next upcoming appointment date
      if (upcomingAppointments.length > 0) {
        const nextUpcoming = upcomingAppointments.sort((a, b) => 
          new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime()
        )[0];
        group.nextAppointmentDate = new Date(nextUpcoming.appointmentDateTime);
      }
      
      return group;
    });

    this.sortCustomerGroups();
  }

  // Sort customer groups based on selected criteria
  private sortCustomerGroups(): void {
    this.customerGroups.sort((a, b) => {
      switch (this.sortBy) {
        case 'nextAppointment':
          // Customers with upcoming appointments first, then by next appointment date
          if (a.nextAppointmentDate && b.nextAppointmentDate) {
            return a.nextAppointmentDate.getTime() - b.nextAppointmentDate.getTime();
          } else if (a.nextAppointmentDate && !b.nextAppointmentDate) {
            return -1;
          } else if (!a.nextAppointmentDate && b.nextAppointmentDate) {
            return 1;
          } else {
            // Both have no upcoming appointments, sort by last appointment date
            const aLastDate = new Date(a.appointments[0]?.appointmentDateTime || 0);
            const bLastDate = new Date(b.appointments[0]?.appointmentDateTime || 0);
            return bLastDate.getTime() - aLastDate.getTime();
          }
          
        case 'name':
          return a.customer.name.localeCompare(b.customer.name);
          
        case 'totalAppointments':
          return b.totalAppointments - a.totalAppointments;
          
        case 'upcomingCount':
          return b.upcomingCount - a.upcomingCount;
          
        default:
          return 0;
      }
    });
  }

  // Filter customers based on search term
  filterCustomers(): void {
    let filtered = [...this.customerGroups];

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(group =>
        group.customer.name.toLowerCase().includes(searchLower) ||
        group.customer.email.toLowerCase().includes(searchLower) ||
        (group.customer.phone && group.customer.phone.toLowerCase().includes(searchLower))
      );
    }

    this.filteredCustomers = filtered;
    this.currentPage = 1;
    this.calculatePagination();
  }

  // Search functionality
  onSearchInput(event: any): void {
    this.searchTerm = event.target.value;
    this.filterCustomers();
  }

  // Sort change handler
  onSortChange(event: any): void {
    this.sortBy = event.target.value;
    this.sortCustomerGroups();
    this.filterCustomers();
  }

  // Select a customer to view their appointments
  selectCustomer(customer: CustomerGroup): void {
    this.selectedCustomer = customer;
    // Reset appointment filters when selecting a new customer
    this.appointmentFilter = 'all';
    this.appointmentStatusFilter = 'all';
  }

  // Go back to customer list
  goBack(): void {
    this.selectedCustomer = null;
  }

  // Get customer appointments (for selected customer view)
  getCustomerAppointments(customerEmail: string): Appointment[] {
    const customer = this.customerGroups.find(g => g.customer.email === customerEmail);
    return customer ? customer.appointments : [];
  }

  // Get appointment count for a customer
  getAppointmentCount(customerEmail: string): number {
    const customer = this.customerGroups.find(g => g.customer.email === customerEmail);
    return customer ? customer.totalAppointments : 0;
  }

  // Get upcoming appointments count
  getUpcomingCount(customer: CustomerGroup): number {
    return customer.upcomingCount;
  }

  // Get next appointment text
  getNextAppointmentText(customer: CustomerGroup): string {
    if (customer.nextAppointmentDate) {
      const diffTime = customer.nextAppointmentDate.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 7) return `In ${diffDays} days`;
      if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
      return `In ${Math.ceil(diffDays / 30)} months`;
    }
    return 'No upcoming appointments';
  }

  // NEW: Get filtered appointments for the selected customer
  getFilteredAppointments(): Appointment[] {
    if (!this.selectedCustomer) {
      return [];
    }

    let filteredAppointments = [...this.selectedCustomer.appointments];

    // Filter by date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (this.appointmentFilter) {
      case 'today':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filteredAppointments = filteredAppointments.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDateTime);
          return appointmentDate >= today && appointmentDate < tomorrow;
        });
        break;
        
      case 'week':
        const weekStart = new Date(today);
        const dayOfWeek = weekStart.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
        weekStart.setDate(weekStart.getDate() - daysToSubtract);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        filteredAppointments = filteredAppointments.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDateTime);
          return appointmentDate >= weekStart && appointmentDate < weekEnd;
        });
        break;
        
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        
        filteredAppointments = filteredAppointments.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDateTime);
          return appointmentDate >= monthStart && appointmentDate < monthEnd;
        });
        break;
    }

    // Filter by status
    if (this.appointmentStatusFilter !== 'all') {
      filteredAppointments = filteredAppointments.filter(appointment =>
        appointment.status.toLowerCase() === this.appointmentStatusFilter.toLowerCase()
      );
    }

    return filteredAppointments;
  }

  // NEW: Handle appointment filter changes
  onAppointmentFilterChange(event: any): void {
    // The ngModel binding will handle the value update
    // This method can be used for additional logic if needed
  }

  // NEW: Clear appointment filters
  clearAppointmentFilters(): void {
    this.appointmentFilter = 'all';
    this.appointmentStatusFilter = 'all';
  }

  // Pagination methods
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
  }

  getDisplayedCustomers(): CustomerGroup[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredCustomers.slice(startIndex, endIndex);
  }

  changePage(next: boolean): void {
    if (next && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (!next && this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredCustomers.length);
    return `${start}-${end}`;
  }

  // Utility methods
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'primary';
      default:
        return 'medium';
    }
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      return 'assets/default-service.jpg';
    }
    return `https://api.gowashapp.online/storage/${imagePath}`;
  }

  // Update appointment status
  async updateStatus(appointment: Appointment, newStatus: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Status Update',
      message: `Are you sure you want to mark this appointment as ${newStatus}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Confirm',
          handler: () => {
            this.performStatusUpdate(appointment, newStatus);
          }
        }
      ]
    });

    await alert.present();
  }

  private performStatusUpdate(appointment: Appointment, newStatus: string): void {
    this.appointmentService.updateAppointmentStatus(appointment.appointmentID, newStatus).subscribe({
      next: (response: any) => {
        console.log('Status updated successfully:', response);
        
        appointment.status = newStatus;
        appointment.updated_at = new Date().toISOString();
        
        // Refresh customer groups to update stats
        this.groupAppointmentsByCustomer();
        this.filterCustomers();
        
        this.presentSuccessToast(`Appointment marked as ${newStatus} successfully!`);
      },
      error: (error: any) => {
        console.error('Error updating appointment status:', error);
        this.presentErrorToast('Failed to update appointment status. Please try again.');
      }
    });
  }

  // Toast methods
  async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  async presentSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }
}