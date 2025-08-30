import { Routes } from '@angular/router';
import { LoginComponent } from './customer/login/login.component';
import { RegisterComponent } from './customer/register/register.component';
import { LandingComponent } from './customer/landing/landing.component';
import { HomePage } from './customer/home/home.page';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminServicesPage } from './admin-services/admin-services.page'; // Import Admin Services Component
import { AdminAuthGuard } from './auth/admin-auth.guard'; // Import Admin Auth Guard
import { AdminAppointmentsPage } from './admin/admin-appointments/admin-appointments.page';
import {ServicesPage} from './customer/services/services.page';
import { BookingPage } from './customer/booking/booking.page';
import { AppointmentPage } from './customer/appointment/appointment.page';
import { SchedulesPage } from './admin/schedules/schedules.page';
import { BookingHistoryPage } from './admin/booking-history/booking-history.page';
import { AdminCustomersPage } from './admin/admin-customers/admin-customers.page';


export const routes: Routes = [
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
    path: 'home',
    component: HomePage,
  },
  {
    path: 'services',
    component: ServicesPage,
  },
  {
    path: 'admin-customers',
    component: AdminCustomersPage,
  },
  {
    path: 'booking-history',
    component: BookingHistoryPage,
  },
  {
    path: 'schedules',
    component: SchedulesPage,
  },
  {
    path: 'booking',
    component: BookingPage,
  },
  {
    path: 'appointment',
    component: AppointmentPage,
  },
  {
    path: 'admin-login',
    component: AdminLoginComponent,
  },
  {
    path: 'admin-dashboard', // Route for admin dashboard
    component: AdminDashboardComponent,
    //canActivate: [AdminAuthGuard], // Protect this route with the Admin Auth Guard
  },
  {
    path: 'admin-services', // Route for admin services
    component: AdminServicesPage,
    //canActivate: [AdminAuthGuard], // Protect this route with the Admin Auth Guard
  },
  {
    path: 'admin-appointments', // Route for admin services
    component: AdminAppointmentsPage,
    //canActivate: [AdminAuthGuard], // Protect this route with the Admin Auth Guard
  },
  {
    path: '**',
    redirectTo: '', // Redirect to landing page for any unknown routes
  },
];
