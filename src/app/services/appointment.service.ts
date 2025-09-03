import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json', // ✅ This is crucial for Laravel API
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return headers;
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`❌ ${operation} failed:`, {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });

      // Specific handling for 401 errors
      if (error.status === 401) {
        console.error('🚫 Authentication failed - check token validity');
        console.error('🔍 Current token:', this.authService.getToken() ? 'Present' : 'Missing');
        console.error('🔍 Current user:', this.authService.getUser() ? 'Present' : 'Missing');
        
        // Optional: Redirect to login or clear invalid token
        // this.authService.logout();
        // this.router.navigate(['/login']);
      }

      return throwError(() => error);
    };
  }

  // Create a new appointment
  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/appointments`,
      appointmentData,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('✅ Appointment created:', response)),
      catchError(this.handleError('Create Appointment'))
    );
  }

  // Fetch all appointments (admin functionality)
  getAppointments(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/appointments`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError('Get Appointments'))
    );
  }

  // Fetch appointments for the logged-in user
  getUserAppointments(): Observable<any> {
    const user = this.authService.getUser();
    
    if (!user) {
      console.error('❌ No user found in auth service');
      return throwError(() => new Error('User not logged in'));
    }

    console.log('🔍 User ID:', user.id);

    return this.http.get<any>(
      `${this.apiUrl}/appointments/user`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('✅ User appointments fetched:', response.length || 0, 'items')),
      catchError(this.handleError('Get User Appointments'))
    );
  }

  // Alternative method using query parameter
  getUserAppointmentsByQuery(): Observable<any> {
    const user = this.authService.getUser();

    if (!user) {
      console.error('❌ No user found for query method');
      return throwError(() => new Error('User not logged in'));
    }

    console.log('👤 Fetching appointments for user ID:', user.id);

    return this.http.get<any>(
      `${this.apiUrl}/appointments?user_id=${user.id}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('User appointments (query) fetched:', response.length || 0, 'items')),
      catchError(this.handleError('Get User Appointments (Query)'))
    );
  }

  // Update appointment status
  updateAppointmentStatus(appointmentId: number, status: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/appointments/${appointmentId}`,
      { status },
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Appointment status updated:', response)),
      catchError(this.handleError('Update Appointment Status'))
    );
  }

  // Get specific appointment
  getAppointment(appointmentId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/appointments/${appointmentId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Appointment fetched:', response)),
      catchError(this.handleError('Get Appointment'))
    );
  }

  // Delete appointment
  deleteAppointment(appointmentId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/appointments/${appointmentId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Appointment deleted:', response)),
      catchError(this.handleError('Delete Appointment'))
    );
  }

  // PayMongo methods
  createPayMongoCheckout(checkoutData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/payments/create-checkout`,
      checkoutData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError('Create PayMongo Checkout'))
    );
  }

  checkPaymentStatus(paymentId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/payments/${paymentId}/status`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError('Check Payment Status'))
    );
  }

  createPayment(paymentData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/payments`,
      paymentData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError('Create Payment'))
    );
  }

  getPayments(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/payments`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError('Get Payments'))
    );
  }
}