import { Routes } from '@angular/router';
import { LoginComponent } from './customer/login/login.component';
import { RegisterComponent } from './customer/register/register.component';
import { LandingComponent } from './customer/landing/landing.component';
import { HomePage } from './customer/home/home.page';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminServicesPage } from './admin-services/admin-services.page';
import { AdminAuthGuard } from './auth/admin-auth.guard';
import { AuthGuard } from './auth/auth.guard'; // Import the AuthGuard
import { AdminAppointmentsPage } from './admin/admin-appointments/admin-appointments.page';
import { ServicesPage } from './customer/services/services.page';
import { BookingPage } from './customer/booking/booking.page';
import { AppointmentPage } from './customer/appointment/appointment.page';
import { SchedulesPage } from './admin/schedules/schedules.page';
import { BookingHistoryPage } from './admin/booking-history/booking-history.page';
import { AdminCustomersPage } from './admin/admin-customers/admin-customers.page';

export const routes: Routes = [
  // Public Routes - No authentication required
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'admin-login',
    component: AdminLoginComponent,
  },
  
  // Protected Customer Routes - Require user authentication
  {
    path: 'home',
    component: HomePage,
    canActivate: [AuthGuard], // Protected route
  },
  {
    path: 'services',
    component: ServicesPage,
    canActivate: [AuthGuard], // Protected route
  },
  {
    path: 'booking',
    component: BookingPage,
    canActivate: [AuthGuard], // Protected route
  },
  {
    path: 'appointment',
    component: AppointmentPage,
    canActivate: [AuthGuard], // Protected route
  },
  
  // Protected Admin Routes - All require admin authentication
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AdminAuthGuard], // Protected route
  },
  {
    path: 'admin-services',
    component: AdminServicesPage,
    canActivate: [AdminAuthGuard], // Protected route
  },
  {
    path: 'admin-appointments',
    component: AdminAppointmentsPage,
    canActivate: [AdminAuthGuard], // Protected route
  },
  {
    path: 'admin-customers',
    component: AdminCustomersPage,
    canActivate: [AdminAuthGuard], // Protected route
  },
  {
    path: 'booking-history',
    component: BookingHistoryPage,
    canActivate: [AdminAuthGuard], // Protected route
  },
  {
    path: 'schedules',
    component: SchedulesPage,
    canActivate: [AdminAuthGuard], // Protected route
  },
  {
    path: '**',
    redirectTo: '', // Redirect to landing page for any unknown routes
  },
];