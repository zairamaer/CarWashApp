import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScreenSizeService } from '../../services/screen-size.service';
import { HeaderComponent } from '../../component/header/header.component'; // ✅ Import Header
import { SidebarComponent } from '../../component/sidebar/sidebar.component'; // ✅ Import Sidebar
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HeaderComponent, SidebarComponent, RouterModule], // ✅ Include Components
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // ✅ Allow Web Components
})
export class LandingComponent {
  constructor(private router: Router, public screenSizeService: ScreenSizeService) {}

  goToLogin() {
    this.router.navigate(['login']);
  }

  goToRegister() {
    this.router.navigate(['register']);
  }
}
