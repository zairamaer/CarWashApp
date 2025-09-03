// admin-login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
  imports: [IonicModule, ReactiveFormsModule, RouterModule, CommonModule],
})
export class AdminLoginComponent implements OnInit {
  adminLoginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.adminLoginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        this.customEmailValidator
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.strongPasswordValidator
      ]]
    });
  }

  ngOnInit(): void {
    // Check if already logged in as admin
    this.checkExistingAuth();
  }

  // Custom email validator for admin emails
  customEmailValidator(control: any) {
    const email = control.value;
    if (email && !email.includes('@')) {
      return { invalidEmail: true };
    }
    // Optional: Add specific admin email domain validation
    // if (email && !email.endsWith('@gowash-admin.com')) {
    //   return { invalidAdminDomain: true };
    // }
    return null;
  }

  // Strong password validator
  strongPasswordValidator(control: any) {
    const password = control.value;
    if (!password) return null;
    
    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[#?!@$%^&*-]/.test(password);
    
    const valid = hasNumber && hasUpper && hasLower && hasSpecial;
    
    if (!valid) {
      return { weakPassword: true };
    }
    return null;
  }

  // Check if user is already authenticated
  checkExistingAuth() {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    
    if (token && role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    }
  }

  // Getter methods for easy access to form controls
  get email() { return this.adminLoginForm.get('email'); }
  get password() { return this.adminLoginForm.get('password'); }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getEmailErrorMessage(): string {
    if (this.email?.hasError('required')) {
      return 'Admin email is required';
    }
    if (this.email?.hasError('email')) {
      return 'Invalid email format';
    }
    if (this.email?.hasError('invalidEmail')) {
      return 'Please enter a valid email address';
    }
    if (this.email?.hasError('invalidAdminDomain')) {
      return 'Please use your admin email address';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) {
      return 'Password is required';
    }
    if (this.password?.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    if (this.password?.hasError('weakPassword')) {
      return 'Password must contain uppercase, lowercase, number and special character';
    }
    return '';
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'top',
      color,
      cssClass: 'custom-toast',
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Authenticating admin credentials...',
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();
    return loading;
  }

  async login() {
    if (this.adminLoginForm.valid && !this.loading) {
      this.loading = true;
      const loading = await this.presentLoading();

      const credentials = {
        email: this.adminLoginForm.get('email')?.value.trim().toLowerCase(),
        password: this.adminLoginForm.get('password')?.value
      };

      this.adminService.login(credentials.email, credentials.password).subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.loading = false;
          
          // Store authentication data
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_role', 'admin');
          localStorage.setItem('admin_user', JSON.stringify(response.user || {}));
          
          await this.presentToast('Welcome back, Admin!', 'success');
          
          // Reset form and navigate
          this.adminLoginForm.reset();
          this.router.navigate(['/admin-dashboard']);
        },
        error: async (error) => {
          await loading.dismiss();
          this.loading = false;
          
          console.error('Admin login failed:', error);
          
          let errorMessage = 'Login failed. Please try again.';
          
          if (error.status === 401) {
            errorMessage = 'Invalid admin credentials. Please check your email and password.';
          } else if (error.status === 403) {
            errorMessage = 'Access denied. Admin privileges required.';
          } else if (error.status === 422) {
            errorMessage = 'Invalid input data. Please check your credentials.';
          } else if (error.status === 429) {
            errorMessage = 'Too many login attempts. Please try again later.';
          } else if (error.status === 0 || error.status === 500) {
            errorMessage = 'Server connection failed. Please try again later.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          await this.presentToast(errorMessage, 'danger');
          
          // Optional: Add login attempt tracking
          this.trackFailedAttempt();
        }
      });
    } else {
      // Form validation errors
      this.adminLoginForm.markAllAsTouched();
      
      const errors = [];
      if (this.email?.invalid) errors.push('Email');
      if (this.password?.invalid) errors.push('Password');
      
      const errorMessage = `Please correct the following fields: ${errors.join(', ')}`;
      await this.presentToast(errorMessage, 'warning');
    }
  }

  // Track failed login attempts for security
  private trackFailedAttempt() {
    const attempts = parseInt(localStorage.getItem('admin_login_attempts') || '0');
    const newAttempts = attempts + 1;
    localStorage.setItem('admin_login_attempts', newAttempts.toString());
    localStorage.setItem('last_failed_attempt', new Date().toISOString());
    
    if (newAttempts >= 5) {
      this.presentToast('Multiple failed attempts detected. Please contact system administrator if you continue to experience issues.', 'warning');
    }
  }

  // Clear failed attempts on successful login (call this in success handler if needed)
  private clearFailedAttempts() {
    localStorage.removeItem('admin_login_attempts');
    localStorage.removeItem('last_failed_attempt');
  }

  // Optional: Add forgot password functionality
  async forgotPassword() {
    const email = this.email?.value;
    if (!email) {
      await this.presentToast('Please enter your admin email first.', 'warning');
      return;
    }
    
    // Implement forgot password logic here
    await this.presentToast('Password reset instructions will be sent to your email.', 'success');
  }
}