// src/app/services/admin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://127.0.0.1:8000/api/admin'; 

  constructor(private http: HttpClient) {}

  // Admin login method
  login(email: string, password: string): Observable<any> {
    const loginData = { email, password };

    // First, ensure we retrieve the CSRF token (needed for Sanctum)
    return this.http.get<any>('http://127.0.0.1:8000/sanctum/csrf-cookie').pipe(
      switchMap(() => {
        // Now that the CSRF token is set, perform the login request
        return this.http.post<any>(`${this.apiUrl}/login`, loginData, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        });
      })
    );
  }

  // Admin logout method
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Send the token if logged in
      })
    });
  }

  // Check if the admin is authenticated (useful for route guards, etc.)
  isAuthenticated(): boolean {
    return localStorage.getItem('access_token') !== null;
  }
}
