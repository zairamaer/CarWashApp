import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ScreenSizeService } from '../../services/screen-size.service';
import { HomeHeaderComponent } from '../../component/home-header/home-header.component';
import { HomeSidebarComponent } from '../../component/home-sidebar/home-sidebar.component';
import { Router, RouterModule } from '@angular/router';
import { ServiceService } from 'src/app/services/service.service';
import { ServiceDetailComponent } from './service-detail/service-detail.component';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HomeHeaderComponent, HomeSidebarComponent, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ScreenSizeService], // Provide the service here
})
export class ServicesPage implements OnInit {
  services: any[] = [];
  filteredServices: any[] = [];
  vehicleSizes: any[] = [];
  selectedSize: string = 'ALL';

  // 🔹 Pagination
  displayedServices: any[] = [];
  displayCount: number = 20; // per page
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private router: Router,
    public screenSizeService: ScreenSizeService,
    private serviceService: ServiceService,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.loadVehicleSizes();
    this.loadServices();
  }

  loadServices() {
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.filterServices(); // apply filter after services are loaded
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
    // 🔹 Reset pagination every time filter is applied
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredServices.length / this.displayCount);
    this.updateDisplayedServices();
  }

  updateDisplayedServices() {
    const startIndex = (this.currentPage - 1) * this.displayCount;
    const endIndex = startIndex + this.displayCount;
    this.displayedServices = this.filteredServices.slice(startIndex, endIndex);
  }

  changePage(next: boolean) {
    if (next && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (!next && this.currentPage > 1) {
      this.currentPage--;
    }
    this.updateDisplayedServices();
  }

  async openServiceDetail(service: any) {
    const modal = await this.modalCtrl.create({
      component: ServiceDetailComponent,
      componentProps: { service },
    });
  
    await modal.present();
  }

  getImageUrl(path: string): string {
    return path || ''; // just return the URL from API
  }
}

