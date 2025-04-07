import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registrationData = {
    name: '',
    email: '',
    phone: '',  // Make sure phone exists
    password: '',
    password_confirmation: '' // Match Laravel's validation
  };

  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.validateForm()) return; // Validate before sending

    this.authService.register(this.registrationData).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = error?.error?.message || 'An error occurred. Please try again.';
      }
    });
  }

  validateForm(): boolean {
    const { name, email, phone, password, password_confirmation } = this.registrationData;
    
    if (!name || !email || !phone || !password || !password_confirmation) {
      this.errorMessage = "All fields are required!";
      return false;
    }

    if (password.length < 8) {
      this.errorMessage = "Password must be at least 8 characters long.";
      return false;
    }

    if (password !== password_confirmation) {
      this.errorMessage = "Passwords do not match!";
      return false;
    }

    this.errorMessage = '';
    return true;
  }
}
