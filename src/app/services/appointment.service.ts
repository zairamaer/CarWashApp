import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Create a new appointment
  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/appointments`,
      appointmentData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        console.error('Appointment creation failed:', err);
        return throwError(() => err);
      })
    );
  }

  // Create PayMongo checkout session
  createPayMongoCheckout(checkoutData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/payments/create-checkout`,
      checkoutData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        console.error('PayMongo checkout creation failed:', err);
        return throwError(() => err);
      })
    );
  }

  // Check payment status
  checkPaymentStatus(paymentId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/payments/${paymentId}/status`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        console.error('Payment status check failed:', err);
        return throwError(() => err);
      })
    );
  }

  // Create a payment record (legacy method)
  createPayment(paymentData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/payments`,
      paymentData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(err => {
        console.error('Payment creation failed:', err);
        return throwError(() => err);
      })
    );
  }

  // Optionally: fetch appointments
  getAppointments(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/appointments`,
      { headers: this.getHeaders() }
    );
  }

  // Optionally: fetch payments
  getPayments(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/payments`,
      { headers: this.getHeaders() }
    );
  }
}