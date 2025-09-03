import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  private routerSubscription!: Subscription;
  adminName: string = 'Admin';

  menuItems = [
    { 
      title: 'Dashboard', 
      icon: 'grid-outline', 
      route: '/admin-dashboard',
      active: false 
    },
    { 
      title: 'Services', 
      icon: 'cog-outline', 
      route: '/admin-services',
      active: false 
    },
    { 
      title: 'Appointments', 
      icon: 'calendar-outline', 
      route: '/admin-appointments',
      active: false 
    },
    { 
      title: 'Upcoming Schedules', 
      icon: 'time-outline', 
      route: '/schedules',
      active: false 
    },
    { 
      title: 'Customers', 
      icon: 'people-outline', 
      route: '/admin-customers',
      active: false 
    },
    { 
      title: 'Reports', 
      icon: 'stats-chart-outline', 
      route: '/admin-reports',
      active: false 
    }
  ];

  constructor(
    private router: Router,
    private adminService: AdminService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Load admin info
    this.loadAdminInfo();
    
    // Set initial active state based on current route
    this.updateActiveState(this.router.url);

    // Listen to router events to update active state
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveState(event.url);
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private loadAdminInfo() {
    const admin = this.adminService.getAdmin();
    if (admin && admin.name) {
      this.adminName = admin.name;
    }
  }

  private updateActiveState(currentUrl: string) {
    // Reset all items to inactive
    this.menuItems.forEach(item => item.active = false);
    
    // Find and activate the matching route
    const activeItem = this.menuItems.find(item => 
      currentUrl === item.route || currentUrl.startsWith(item.route + '/')
    );
    
    if (activeItem) {
      activeItem.active = true;
    }
  }

  onMenuItemClick(selectedItem: any) {
    // Optional: Add any additional logic you want to run on menu item click
    console.log('Navigating to:', selectedItem.route);
  }

  async onLogout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Logout',
          handler: () => {
            this.performLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  private async performLogout() {
    const loading = await this.loadingController.create({
      message: 'Logging out...',
      duration: 5000
    });

    await loading.present();

    try {
      await this.adminService.logout().toPromise();
      
      // Show success message
      const toast = await this.toastController.create({
        message: 'Successfully logged out',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
      // Redirect to admin login
      this.router.navigate(['/admin-login']);
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if logout fails on server, clear local data and redirect
      this.adminService.clearAdminData();
      
      const toast = await this.toastController.create({
        message: 'Logged out (connection error)',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      
      this.router.navigate(['/admin-login']);
    } finally {
      await loading.dismiss();
    }
  }
}