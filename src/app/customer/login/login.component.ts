import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-login',
  standalone: true, // Ensure this is a standalone component
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [IonicModule, FormsModule, RouterModule], // Add IonicModule and FormsModule
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_name', response.data.name); // Store user name
        this.router.navigate(['/home']); 
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }

}
