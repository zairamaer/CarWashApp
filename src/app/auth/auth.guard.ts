// src/app/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    
    const isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getUser();
    
    console.log('AuthGuard - Route Protection Check:', {
      route: state.url,
      isLoggedIn,
      hasUser: !!user,
      timestamp: new Date().toISOString()
    });

    if (isLoggedIn && user) {
      // User is authenticated, allow access
      return true;
    } else {
      // User is not authenticated
      console.log('Access denied - User not authenticated');
      
      // Show warning message
      await this.showAuthenticationWarning();
      
      // Clean up any invalid session data
      this.authService.clearUserData();
      
      // Redirect to login page
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      
      return false;
    }
  }

  private async showAuthenticationWarning() {
    const toast = await this.toastController.create({
      message: 'Please login to access this page',
      duration: 3000,
      position: 'top',
      color: 'warning',
      buttons: [
        {
          text: 'Login',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    
    await toast.present();
  }

  // Alternative method using Alert instead of Toast
  private async showAuthenticationAlert() {
    const alert = await this.alertController.create({
      header: 'Authentication Required',
      message: 'You need to login to access this page.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.router.navigate(['/']);
          }
        },
        {
          text: 'Login',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }
}