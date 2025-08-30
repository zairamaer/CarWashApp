import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomeSidebarComponent } from '../../component/home-sidebar/home-sidebar.component'; // ✅ Import Sidebar
import { HomeHeaderComponent } from '../../component/home-header/home-header.component';
import { ScreenSizeService } from '../../services/screen-size.service'; // ✅ Import this


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    HomeHeaderComponent,
    CommonModule, 
    IonicModule,
    HomeSidebarComponent,
    RouterModule
  ],
})
export class HomePage implements OnInit {
  userName: string | null = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    public screenSizeService: ScreenSizeService // ✅ Make public for use in template
  ) {}

  ngOnInit() {
    this.userName = localStorage.getItem('user_name');
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_name');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed', error);
      }
    });
  }
}
