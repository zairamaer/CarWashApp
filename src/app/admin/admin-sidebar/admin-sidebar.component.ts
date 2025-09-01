import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  private routerSubscription!: Subscription;

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

  constructor(private router: Router) {}

  ngOnInit() {
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
}