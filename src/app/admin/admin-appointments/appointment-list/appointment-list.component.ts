import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from 'src/app/services/appointment.service';

// Define interfaces for type safety
interface Customer {
  name: string;
  email: string;
}

interface ServiceType {
  serviceTypeName: string;
}

interface ServiceRate {
  vehicleSize: string;
  price: number;
}

interface Appointment {
  customer: Customer;
  service_type: ServiceType;
  service_rate: ServiceRate;
  appointmentDateTime: string | Date;
  status: string;
  notes: string;
}

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  selectedCustomer: Customer | null = null;
  searchTerm: string = '';
  filteredCustomers: Customer[] = [];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  // Load appointments from service
  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (data: Appointment[]) => {
        this.appointments = data;
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });
  }

  // Get unique customers from appointments
  get customers(): Customer[] {
    const uniqueCustomers = this.appointments.reduce((acc: Customer[], appointment: Appointment) => {
      const existingCustomer = acc.find((c: Customer) => c.email === appointment.customer.email);
      if (!existingCustomer) {
        acc.push({
          name: appointment.customer.name,
          email: appointment.customer.email
        });
      }
      return acc;
    }, []);
    return uniqueCustomers;
  }

  loadCustomers(): void {
    this.filteredCustomers = this.customers;
  }

  // Filter customers based on search term
  filterCustomers(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.filteredCustomers = this.customers;
    } else {
      this.filteredCustomers = this.customers.filter((customer: Customer) =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm)
      );
    }
  }

  // Select a customer to view their appointments
  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
  }

  // Go back to customer list
  goBack(): void {
    this.selectedCustomer = null;
  }

  // Get initials for avatar
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Get appointment count for a customer
  getAppointmentCount(email: string): number {
    return this.appointments.filter((appointment: Appointment) => 
      appointment.customer.email === email
    ).length;
  }

  // Get all appointments for a specific customer
  getCustomerAppointments(email: string): Appointment[] {
    return this.appointments.filter((appointment: Appointment) => 
      appointment.customer.email === email
    ).sort((a: Appointment, b: Appointment) => 
      new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime()
    );
  }
}