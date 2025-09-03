import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Register a new user
  register(registrationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, registrationData).pipe(
      tap((response) => this.saveUserData(response)),
      catchError((error) => {
        console.error('Registration failed:', error);
        return throwError(() => new Error('Registration failed'));
      })
    );
  }

  // Login existing user
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => this.saveUserData(response)),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  // Logout user
  logout(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      console.warn('No token found.');
      return throwError(() => new Error('User not logged in'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => this.clearUserData()),
      catchError((error) => {
        console.error('Logout failed:', error);
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  // Save user data from response
  private saveUserData(response: any): void {
    if (response && response.access_token && response.data) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_name', response.data.name ?? '');
      localStorage.setItem('user_id', response.data.id?.toString() ?? '');
    } else {
      console.warn('saveUserData: missing response data', response);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  clearUserData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): any {
    const token = this.getToken();
    const id = localStorage.getItem('user_id');
    const name = localStorage.getItem('user_name');
    if (!token || !id || !name) return null;
    return { id: Number(id), name };
  }
}
