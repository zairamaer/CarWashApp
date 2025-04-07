// admin-login.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service'; // Import AdminService
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonSpinner
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonSpinner,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ]
})
export class AdminLoginComponent implements OnInit {  //Added OnInit
  adminLoginForm: FormGroup;
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService, // Use AdminService
    private router: Router
  ) {
    this.adminLoginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}   //Added OnInit

  get formControls() {
    return this.adminLoginForm.controls;
  }

  login() {
    if (this.adminLoginForm.valid) {
      this.loading = true;
      const credentials = this.adminLoginForm.value;

      // Changed authService to adminService
      this.adminService.login(credentials.email, credentials.password).subscribe({
        next: (response) => {
          console.log('Admin login successful:', response);

          // Store tokens and role in localStorage
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_role', 'admin');

          // Reset form and navigate to dashboard
          this.adminLoginForm.reset();
          this.loading = false;
          this.router.navigate(['/admin-dashboard']);
        },
        error: (error) => {
          console.error('Admin login failed:', error);
          this.loading = false;

          // Enhanced Error Handling
          if (error.status === 401) {
            alert('Unauthorized: Incorrect email or password.');
          } else if (error.status === 0) {
            alert('Network error: Unable to reach the server.');
          } else {
            alert('Login failed. Please try again later.');
          }
        }
      });
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }
}
