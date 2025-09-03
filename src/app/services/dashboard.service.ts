// src/app/services/dashboard.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

export interface DashboardStats {
  todaysBookings: number;
  todaysRevenue: number;
  totalCustomers: number;
  totalServices: number;
  yesterdaysBookings: number;
  yesterdaysRevenue: number;
  weeklyStats: {
    bookings: number;
    revenue: number;
    customers: number;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  upcomingAppointments: any[];
  recentActivities: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Get complete dashboard data (WITHOUT customers - handled by CustomerService)
  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      appointments: this.getAppointments(),
      services: this.getServices(),
      payments: this.getPayments()
      // ❌ Removed customers - now handled by CustomerService
    }).pipe(
      map(data => this.processDashboardData(data)),
      catchError(error => {
        console.error('Dashboard data fetch error:', error);
        return throwError(() => error);
      })
    );
  }

  // Get dashboard statistics (WITHOUT customers)
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      appointments: this.getAppointments(),
      services: this.getServices(),
      payments: this.getPayments()
      // ❌ Removed customers - now handled by CustomerService
    }).pipe(
      map(data => this.calculateDashboardStats(data.appointments, data.services, data.payments)),
      catchError(error => {
        console.error('Dashboard stats fetch error:', error);
        return throwError(() => error);
      })
    );
  }

  // Get appointments from API
  private getAppointments(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/appointments`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (Array.isArray(response)) return response;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        return [];
      }),
      catchError(error => {
        console.warn('Appointments fetch failed:', error);
        return [];
      })
    );
  }

  // Get services from API
  private getServices(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/service-rates`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (Array.isArray(response)) return response;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        return [];
      }),
      catchError(error => {
        console.warn('Services fetch failed:', error);
        return [];
      })
    );
  }

  // Get payments from API
  private getPayments(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/payments`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (Array.isArray(response)) return response;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        return [];
      }),
      catchError(error => {
        console.warn('Payments fetch failed:', error);
        return [];
      })
    );
  }

  // Process raw data into dashboard format (WITHOUT customers)
  private processDashboardData(rawData: {
    appointments: any[],
    services: any[],
    payments: any[]
  }): DashboardData {
    const stats = this.calculateDashboardStats(
      rawData.appointments,
      rawData.services,
      rawData.payments
    );

    const upcomingAppointments = this.getUpcomingAppointments(rawData.appointments);
    const recentActivities = this.generateRecentActivities(
      rawData.appointments,
      rawData.payments
    );

    return {
      stats,
      upcomingAppointments,
      recentActivities
    };
  }

  // ✅ Updated calculateDashboardStats without customers parameter
  private calculateDashboardStats(
    appointments: any[],
    services: any[],
    payments: any[]
  ): DashboardStats {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Filter appointments by date
    const todaysAppointments = appointments.filter(apt => {
      try {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate >= today && aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      } catch (error) {
        console.warn('Invalid appointment date:', apt.appointmentDateTime);
        return false;
      }
    });

    const yesterdaysAppointments = appointments.filter(apt => {
      try {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate >= yesterday && aptDate < today;
      } catch (error) {
        return false;
      }
    });

    const thisWeekAppointments = appointments.filter(apt => {
      try {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate >= weekAgo && aptDate < today;
      } catch (error) {
        return false;
      }
    });

    // Calculate revenue
    const todaysRevenue = todaysAppointments.reduce((sum, apt) => {
      const price = parseFloat(apt.service_rate?.price || apt.price || '0');
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const yesterdaysRevenue = yesterdaysAppointments.reduce((sum, apt) => {
      const price = parseFloat(apt.service_rate?.price || apt.price || '0');
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const weeklyRevenue = thisWeekAppointments.reduce((sum, apt) => {
      const price = parseFloat(apt.service_rate?.price || apt.price || '0');
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    // Weekly new customers from appointments
    const weeklyCustomerIds = new Set(
      thisWeekAppointments
        .map(apt => apt.customerID)
        .filter(id => id != null)
    );

    return {
      todaysBookings: todaysAppointments.length,
      todaysRevenue,
      totalCustomers: 0, // ✅ Will be updated by CustomerService
      totalServices: services.length,
      yesterdaysBookings: yesterdaysAppointments.length,
      yesterdaysRevenue,
      weeklyStats: {
        bookings: thisWeekAppointments.length,
        revenue: weeklyRevenue,
        customers: weeklyCustomerIds.size
      }
    };
  }

  // Get upcoming appointments
  private getUpcomingAppointments(appointments: any[]): any[] {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return appointments
      .filter(apt => {
        try {
          const aptDate = new Date(apt.appointmentDateTime);
          return aptDate >= now && 
                 aptDate <= nextWeek && 
                 apt.status !== 'cancelled' &&
                 apt.status !== 'completed';
        } catch (error) {
          console.warn('Invalid appointment date:', apt.appointmentDateTime);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime();
        } catch (error) {
          return 0;
        }
      })
      .slice(0, 5)
      .map(apt => this.formatAppointmentForDisplay(apt));
  }

  // Format appointment for display
  private formatAppointmentForDisplay(appointment: any): any {
    try {
      const appointmentDate = new Date(appointment.appointmentDateTime);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let dateLabel = appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      if (appointmentDate.toDateString() === today.toDateString()) {
        dateLabel = 'Today';
      } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
        dateLabel = 'Tomorrow';
      }

      return {
        appointmentID: appointment.appointmentID || appointment.id,
        customerName: appointment.customer?.name || appointment.customerName || 'Unknown Customer',
        serviceName: appointment.service_type?.serviceTypeName || appointment.serviceName || 'Unknown Service',
        vehicleType: this.formatVehicleType(appointment.service_rate || appointment),
        time: appointmentDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        date: dateLabel,
        status: this.capitalizeFirst(appointment.status || 'pending'),
        price: parseFloat(appointment.service_rate?.price || appointment.price || '0'),
        appointmentDateTime: appointment.appointmentDateTime
      };
    } catch (error) {
      console.warn('Error formatting appointment:', error);
      return {
        appointmentID: appointment.appointmentID || appointment.id || 0,
        customerName: 'Unknown Customer',
        serviceName: 'Unknown Service',
        vehicleType: 'Unknown Vehicle',
        time: 'Unknown Time',
        date: 'Unknown Date',
        status: 'Pending',
        price: 0,
        appointmentDateTime: appointment.appointmentDateTime
      };
    }
  }

  // Format vehicle type display
  private formatVehicleType(serviceRate: any): string {
    if (!serviceRate) return 'Unknown Vehicle';
    
    const vehicleSize = serviceRate.vehicleSizeCode || serviceRate.vehicleSize || 'Unknown';
    const vehicleDescription = serviceRate.vehicle_size?.vehicleSizeDescription || '';
    
    if (vehicleDescription) {
      return `${vehicleSize} (${vehicleDescription})`;
    }
    
    return `${vehicleSize} Vehicle`;
  }

  // Generate recent activities
  private generateRecentActivities(appointments: any[], payments: any[]): any[] {
    const activities: any[] = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Add recent appointments
    const recentAppointments = appointments
      .filter(apt => {
        try {
          return apt.created_at && new Date(apt.created_at) >= oneDayAgo;
        } catch (error) {
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } catch (error) {
          return 0;
        }
      })
      .slice(0, 4);

    recentAppointments.forEach(apt => {
      activities.push({
        id: `apt_${apt.appointmentID || apt.id}`,
        type: 'booking',
        icon: this.getActivityIcon('booking', apt.status),
        message: this.generateAppointmentMessage(apt),
        time: this.getRelativeTime(apt.created_at),
        timestamp: new Date(apt.created_at).getTime()
      });
    });

    // Add recent payments if available
    if (payments && Array.isArray(payments)) {
      const recentPayments = payments
        .filter(payment => {
          try {
            return payment.created_at && new Date(payment.created_at) >= oneDayAgo;
          } catch (error) {
            return false;
          }
        })
        .sort((a, b) => {
          try {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          } catch (error) {
            return 0;
          }
        })
        .slice(0, 3);

      recentPayments.forEach(payment => {
        const amount = parseFloat(payment.amount || '0');
        activities.push({
          id: `pay_${payment.id}`,
          type: 'payment',
          icon: 'cash-outline',
          message: `Payment received - ₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          time: this.getRelativeTime(payment.created_at),
          timestamp: new Date(payment.created_at).getTime()
        });
      });
    }

    // Add customer registration activities (derived from new appointments)
    const newCustomerAppointments = appointments
      .filter(apt => {
        try {
          const createdDate = new Date(apt.created_at);
          return createdDate >= oneDayAgo;
        } catch (error) {
          return false;
        }
      })
      .filter((apt, index, arr) => 
        // Only include if this is the customer's first appointment
        arr.findIndex(a => a.customerID === apt.customerID) === index
      )
      .slice(0, 2);

    newCustomerAppointments.forEach(apt => {
      activities.push({
        id: `new_customer_${apt.customerID}`,
        type: 'customer',
        icon: 'person-add-outline',
        message: `New customer registered: ${apt.customer?.name || 'Unknown Customer'}`,
        time: this.getRelativeTime(apt.created_at),
        timestamp: new Date(apt.created_at).getTime()
      });
    });

    // Sort all activities by timestamp (newest first) and limit to 6
    const sortedActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);

    // Add default activity if no recent activities
    if (sortedActivities.length === 0) {
      sortedActivities.push({
        id: 'default_1',
        type: 'system',
        icon: 'information-circle-outline',
        message: 'Dashboard initialized successfully',
        time: 'Just now',
        timestamp: Date.now()
      });
    }

    return sortedActivities;
  }

  // Get appointment activity type
  private getAppointmentActivityType(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'confirmation';
      case 'completed':
        return 'completion';
      case 'cancelled':
        return 'cancellation';
      default:
        return 'booking';
    }
  }

  // Generate appointment activity message
  private generateAppointmentMessage(appointment: any): string {
    const customerName = appointment.customer?.name || appointment.customerName || 'Unknown Customer';
    const serviceName = appointment.service_type?.serviceTypeName || appointment.serviceName || 'service';
    const status = appointment.status?.toLowerCase();

    switch (status) {
      case 'confirmed':
        return `Booking confirmed for ${customerName} - ${serviceName}`;
      case 'completed':
        return `Service completed for ${customerName} - ${serviceName}`;
      case 'cancelled':
        return `Booking cancelled for ${customerName} - ${serviceName}`;
      default:
        return `New booking from ${customerName} for ${serviceName}`;
    }
  }

  // Get activity icon based on type and status
  private getActivityIcon(type: string, status?: string): string {
    switch (type) {
      case 'booking':
        switch (status?.toLowerCase()) {
          case 'completed':
            return 'checkmark-circle-outline';
          case 'cancelled':
            return 'close-circle-outline';
          case 'confirmed':
            return 'calendar-outline';
          default:
            return 'calendar-outline';
        }
      case 'payment':
        return 'cash-outline';
      case 'customer':
        return 'person-add-outline';
      case 'system':
        return 'information-circle-outline';
      default:
        return 'information-circle-outline';
    }
  }

  // Get relative time string
  private getRelativeTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown time';
    }
  }

  // Capitalize first letter
  private capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Calculate percentage change
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Get growth indicators
  getGrowthIndicators(stats: DashboardStats): {
    bookingGrowth: number;
    revenueGrowth: number;
    customerGrowth: number;
  } {
    return {
      bookingGrowth: this.calculatePercentageChange(stats.todaysBookings, stats.yesterdaysBookings),
      revenueGrowth: this.calculatePercentageChange(stats.todaysRevenue, stats.yesterdaysRevenue),
      customerGrowth: stats.weeklyStats.customers // This represents new customers this week
    };
  }

  // Refresh dashboard data (can be called manually or on interval)
  refreshDashboard(): Observable<DashboardData> {
    return this.getDashboardData();
  }

  // Get dashboard data with error handling and fallbacks
  getDashboardDataSafe(): Observable<DashboardData> {
    return this.getDashboardData().pipe(
      catchError(error => {
        console.error('Dashboard data fetch failed, returning fallback data:', error);
        
        // Return fallback data structure
        return [{
          stats: {
            todaysBookings: 0,
            todaysRevenue: 0,
            totalCustomers: 0, // Will be updated by CustomerService
            totalServices: 0,
            yesterdaysBookings: 0,
            yesterdaysRevenue: 0,
            weeklyStats: {
              bookings: 0,
              revenue: 0,
              customers: 0
            }
          },
          upcomingAppointments: [],
          recentActivities: [{
            id: 'error_1',
            type: 'system',
            icon: 'warning-outline',
            message: 'Unable to load recent data. Please check your connection.',
            time: 'Just now',
            timestamp: Date.now()
          }]
        }];
      })
    );
  }
}