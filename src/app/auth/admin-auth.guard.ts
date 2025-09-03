// Enhanced Admin Auth Guard with better token validation
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    
    // Check if token exists and is not empty
    if (token && token.trim() !== '') {
      // Optional: Add token expiration check here if needed
      // const tokenExpiry = localStorage.getItem('token_expiry');
      // if (tokenExpiry && new Date().getTime() > parseInt(tokenExpiry)) {
      //   localStorage.removeItem('access_token');
      //   localStorage.removeItem('token_expiry');
      //   this.router.navigate(['/admin-login']);
      //   return false;
      // }
      return true;
    } else {
      // Clear any invalid token data
      localStorage.removeItem('access_token');
      this.router.navigate(['/admin-login']);
      return false;
    }
  }
}