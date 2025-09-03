// src/app/services/admin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Admin login
   */
  login(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    
    console.log('Admin login attempt:', { email }); // Debug log
    
    return this.http.post<any>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        console.log('Admin login response:', response); // Debug log
        this.saveAdminData(response);
      }),
      catchError((error) => {
        console.error('Admin login failed:', error);
        return throwError(() => new Error('Admin login failed'));
      })
    );
  }

  /**
   * Admin logout - Use the admin logout endpoint
   */
  logout(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      console.warn('No admin token found.');
      this.clearAdminData(); // Clear any remaining data
      return throwError(() => new Error('Admin not logged in'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Logout request with token:', `Bearer ${token}`);
    
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => {
        console.log('Admin logout successful');
        this.clearAdminData();
      }),
      catchError((error) => {
        console.error('Admin logout failed:', error);
        // Still clear data even if server logout fails
        this.clearAdminData();
        return throwError(() => new Error('Admin logout failed'));
      })
    );
  }

  /**
   * Save admin data from response
   */
  private saveAdminData(response: any): void {
    console.log('Raw admin login response:', response);
    
    if (response) {
      // Clear any existing data first
      this.clearAdminData();
      
      // Store the token - check different possible locations
      const token = response.access_token || response.token;
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        console.error('No token found in response!');
      }
      
      // Store user data
      const userData = response.data || response.user || response;
      if (userData) {
        localStorage.setItem('admin_name', userData.username || userData.name || '');
        localStorage.setItem('admin_id', userData.id?.toString() || '');
        localStorage.setItem('admin_email', userData.email || '');
        localStorage.setItem('user_type', 'admin');
        
        // Store complete admin object
        const adminUser = {
          id: userData.id,
          username: userData.username || userData.name,
          email: userData.email,
          role: 'admin'
        };
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        
      }
    } else {
      console.error('No response data received');
    }
  }

  /**
   * Get admin token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Clear admin data from localStorage
   */
  clearAdminData(): void {
    const keysToRemove = [
      'access_token',
      'admin_name', 
      'admin_id',
      'admin_email',
      'user_type',
      'admin_user',
      'user_role', // Clear this too in case it exists
      'admin_login_attempts',
      'last_failed_attempt'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
  }

  /**
   * Check if admin is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const userType = localStorage.getItem('user_type');
    const isAuth = !!(token && userType === 'admin');
    
    console.log('Admin auth check:', { 
      hasToken: !!token, 
      userType, 
      isAuthenticated: isAuth 
    });
    
    return isAuth;
  }

  /**
   * Get admin user data
   */
  getAdmin(): any {
    const token = this.getToken();
    
    if (!token) {
      console.log('No token found, admin not authenticated');
      return null;
    }
    
    // Try to get from admin_user object first
    const adminUserStr = localStorage.getItem('admin_user');
    if (adminUserStr && adminUserStr !== '{}') {
      try {
        const adminUser = JSON.parse(adminUserStr);
        console.log('Retrieved admin from admin_user object:', adminUser);
        return {
          ...adminUser,
          name: adminUser.username, // Add name alias
          userType: 'admin'
        };
      } catch (error) {
        console.error('Error parsing admin_user:', error);
      }
    }
    
    // Fallback to individual keys
    const id = localStorage.getItem('admin_id');
    const name = localStorage.getItem('admin_name');
    const email = localStorage.getItem('admin_email');
    const userType = localStorage.getItem('user_type');
    
    if (id && name && userType === 'admin') {
      const admin = {
        id: Number(id),
        name,
        username: name,
        email,
        role: 'admin',
        userType
      };
      console.log('Retrieved admin from individual keys:', admin);
      return admin;
    }
    
    return null;
  }

  /**
   * Check if current user is logged in (alias for isAuthenticated)
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}