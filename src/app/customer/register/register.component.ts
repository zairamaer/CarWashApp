// register.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [IonicModule, ReactiveFormsModule, RouterModule, CommonModule],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9+\-\s\(\)]{10,15}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.strongPasswordValidator
      ]],
      password_confirmation: ['', [
        Validators.required
      ]]
    }, { validators: this.passwordMatchValidator });
  }

  // Strong password validator
  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null; // Let required validator handle empty values
    }

    // Check for at least one uppercase letter
    const hasUpperCase = /[A-Z]/.test(value);
    
    // Check for at least one lowercase letter  
    const hasLowerCase = /[a-z]/.test(value);
    
    // Check for at least one number
    const hasNumber = /[0-9]/.test(value);
    
    // Check for at least one special character
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    
    // Check minimum length
    const hasMinLength = value.length >= 8;
    
    const errors: ValidationErrors = {};
    
    if (!hasUpperCase) {
      errors['missingUpperCase'] = true;
    }
    
    if (!hasLowerCase) {
      errors['missingLowerCase'] = true;
    }
    
    if (!hasNumber) {
      errors['missingNumber'] = true;
    }
    
    if (!hasSpecialChar) {
      errors['missingSpecialChar'] = true;
    }
    
    if (!hasMinLength) {
      errors['minlength'] = { requiredLength: 8, actualLength: value.length };
    }
    
    return Object.keys(errors).length === 0 ? null : errors;
  }

  // Custom validator for password confirmation
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirmation');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  // Getter methods for easy access to form controls
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get phone() { return this.registerForm.get('phone'); }
  get password() { return this.registerForm.get('password'); }
  get password_confirmation() { return this.registerForm.get('password_confirmation'); }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getNameErrorMessage(): string {
    if (this.name?.hasError('required')) {
      return 'Name is required';
    }
    if (this.name?.hasError('minlength')) {
      return 'Name must be at least 2 characters';
    }
    return '';
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

  getPhoneErrorMessage(): string {
    if (this.phone?.hasError('required')) {
      return 'Phone number is required';
    }
    if (this.phone?.hasError('pattern')) {
      return 'Invalid phone number format';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) {
      return 'Password is required';
    }
    if (this.password?.hasError('minlength')) {
      return 'Password must be at least 8 characters long';
    }
    if (this.password?.hasError('missingUpperCase')) {
      return 'Password must contain at least one uppercase letter';
    }
    if (this.password?.hasError('missingLowerCase')) {
      return 'Password must contain at least one lowercase letter';
    }
    if (this.password?.hasError('missingNumber')) {
      return 'Password must contain at least one number';
    }
    if (this.password?.hasError('missingSpecialChar')) {
      return 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?)';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.password_confirmation?.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.password_confirmation?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  // Method to get password strength
  getPasswordStrength(): string {
    const password = this.password?.value || '';
    
    if (!password) return '';
    
    let strength = 0;
    
    // Check criteria
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    if (password.length >= 8) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    if (strength <= 4) return 'strong';
    return 'very-strong';
  }

  // Method to check if password meets all requirements
  isPasswordValid(): boolean {
    const password = this.password?.value || '';
    
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
  }

  // Helper methods for template to check individual password requirements
  hasUpperCase(): boolean {
    const password = this.password?.value || '';
    return /[A-Z]/.test(password);
  }

  hasLowerCase(): boolean {
    const password = this.password?.value || '';
    return /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.password?.value || '';
    return /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.password?.value || '';
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }

  hasMinLength(): boolean {
    const password = this.password?.value || '';
    return password.length >= 8;
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
      message: 'Creating your account...',
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();
    return loading;
  }

  async register() {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      const loading = await this.presentLoading();

      const registrationData = {
        name: this.registerForm.get('name')?.value.trim(),
        email: this.registerForm.get('email')?.value.trim().toLowerCase(),
        phone: this.registerForm.get('phone')?.value.trim(),
        password: this.registerForm.get('password')?.value,
        password_confirmation: this.registerForm.get('password_confirmation')?.value
      };

      this.authService.register(registrationData).subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isLoading = false;
          await this.presentToast('Account created successfully!', 'success');
          this.router.navigate(['/home']);
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          
          let errorMessage = 'Registration failed. Please try again.';
          if (error.status === 422) {
            errorMessage = 'Email already exists or invalid data provided.';
          } else if (error.status === 0) {
            errorMessage = 'Network error. Check your connection.';
          }
          
          await this.presentToast(errorMessage);
          console.error('Registration error:', error);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      await this.presentToast('Please correct the errors above.');
    }
  }
}