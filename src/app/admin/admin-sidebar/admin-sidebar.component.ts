import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule for navigation

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule], // Ensure RouterModule is imported
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {}
