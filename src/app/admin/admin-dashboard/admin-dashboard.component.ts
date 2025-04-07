import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import {AdminSidebarComponent} from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [IonicModule, FormsModule, AdminSidebarComponent],
})
export class AdminDashboardComponent {
  constructor(private adminService: AdminService, private router: Router) {}

  logout() {
    this.adminService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        localStorage.clear();
        this.router.navigate(['/admin-login']);
      },
      error: (error: any) => {
        console.error('Logout failed:', error);
        localStorage.clear();
        this.router.navigate(['/admin-login']);
      }
    });
  }
  
  
}
