import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons],
})
export class HomePage {
  userName: string | null = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.userName = localStorage.getItem('user_name'); // Retrieve the stored name
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        localStorage.removeItem('access_token'); 
        localStorage.removeItem('user_name'); // Remove user name on logout
        this.router.navigate(['/login']); 
      },
      error: (error) => {
        console.error('Logout failed', error);
      }
    });
  }
}
