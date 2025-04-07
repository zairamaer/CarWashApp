import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Register a new user
  register(registrationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, registrationData).pipe(
      tap((response) => {
        // On successful registration, store the token and user name in localStorage (if necessary)
        // You may choose to log the user in directly after registration or simply show success.
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_name', response.data.name);
        }
      }),
      catchError((error) => {
        console.error('Registration failed', error);
        return throwError(() => new Error('Registration failed'));
      })
    );
  }

  // Log in an existing user
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Store the token and user name in localStorage on successful login
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_name', response.data.name);
      }),
      catchError((error) => {
        console.error('Login failed', error);
        return throwError(() => new Error('Login failed')); // Handle error properly
      })
    );
  }

  // Log out the user
  logout(): Observable<any> {
    const token = this.getToken(); // Retrieve the token from localStorage
    if (!token) {
      return throwError(() => new Error('No token found. User is not logged in.'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => {
        this.clearToken();
      }),
      catchError((error) => {
        console.error('Logout failed', error);
        return throwError(() => new Error('Logout failed.'));
      })
    );
  }

  // Get the token from localStorage
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Remove the token from localStorage (logout)
  clearToken(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // Get the user information from localStorage
  getUser(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const payload = atob(token.split('.')[1]); // Decode the JWT payload
    return JSON.parse(payload);
  }
}
