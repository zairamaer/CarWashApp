// login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [IonicModule, ReactiveFormsModule, RouterModule, CommonModule],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  ngOnInit() {
    // Clear fields when component initializes
    this.clearForm();

    // Listen for navigation events to clear fields when coming from logout
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Clear fields when navigating to login page
        this.clearForm();
      }
    });
  }

  // Method to clear the form fields
  clearForm() {
    this.loginForm.reset({
      email: '',
      password: ''
    });
    this.showPassword = false; // Reset password visibility
    console.log('Login form cleared');
  }

  // Getter methods for easy access to form controls
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getEmailErrorMessage(): string {
    if (this.email?.hasError('required')) {
      return 'Email is required';
    }
    if (this.email?.hasError('email') || this.email?.hasError('pattern')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) {
      return 'Password is required';
    }
    if (this.password?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      cssClass: 'custom-toast'
    });
    toast.present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Signing you in...',
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();
    return loading;
  }

  // Method to manually clear fields (can be called from template)
  onClearFields() {
    this.clearForm();
  }

  async login() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const loading = await this.presentLoading();

      const credentials = {
        email: this.loginForm.get('email')?.value.trim().toLowerCase(),
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(credentials).subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isLoading = false;
          await this.presentToast('Login successful! Welcome back.', 'success');
          this.router.navigate(['/home']);
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          
          let errorMessage = 'Login failed. Please try again.';
          if (error.status === 401) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (error.status === 429) {
            errorMessage = 'Too many login attempts. Please try again later.';
          } else if (error.status === 0) {
            errorMessage = 'Network error. Please check your connection.';
          }
          
          await this.presentToast(errorMessage);
          console.error('Login error:', error);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      await this.presentToast('Please correct the errors above.');
    }
  }
}