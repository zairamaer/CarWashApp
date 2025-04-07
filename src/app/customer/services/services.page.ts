import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ScreenSizeService } from '../../services/screen-size.service';
import { HeaderComponent } from '../../component/header/header.component';
import { SidebarComponent } from '../../component/sidebar/sidebar.component';
import { Router, RouterModule } from '@angular/router';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, SidebarComponent, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ScreenSizeService], // Provide the service here
})
export class ServicesPage implements OnInit {
  services: any[] = [];
  filteredServices: any[] = [];
  vehicleSizes: any[] = [];
  selectedSize: string = 'ALL';

  constructor(
    private router: Router,
    public screenSizeService: ScreenSizeService,
    private serviceService: ServiceService
  ) {}

  ngOnInit() {
    this.loadVehicleSizes();
    this.loadServices();
  }

  loadServices() {
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.filterServices(); // Apply filter after services are loaded
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  loadVehicleSizes() {
    this.serviceService.getVehicleSizes().subscribe({
      next: (data) => {
        this.vehicleSizes = data;
      },
      error: (error) => {
        console.error('Error loading vehicle sizes:', error);
      }
    });
  }

  selectSize(sizeCode: string) {
    this.selectedSize = sizeCode;
    this.filterServices();
  }

  filterServices() {
    if (this.selectedSize === 'ALL') {
      this.filteredServices = this.services;
    } else {
      this.filteredServices = this.services.filter(service => service.vehicleSizeCode === this.selectedSize);
    }
  }
}
