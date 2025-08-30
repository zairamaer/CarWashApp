import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { ServiceDetailComponent } from './service-detail/service-detail.component';
import { HeaderComponent } from '../../component/header/header.component';
import { SidebarComponent } from '../../component/sidebar/sidebar.component';
import { HomeHeaderComponent } from '../../component/home-header/home-header.component';
import { HomeSidebarComponent } from '../../component/home-sidebar/home-sidebar.component';
import { ScreenSizeService } from '../../services/screen-size.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServiceDetailComponent,
    HomeHeaderComponent,
    HomeSidebarComponent
  ],
  providers: [ScreenSizeService]
})
export class BookingPage implements OnInit {
  selectedService: any;

  constructor(public screenSizeService: ScreenSizeService, private router: Router) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.selectedService = nav.extras.state['selectedService'];
    }
  }

  ngOnInit() {}
}
