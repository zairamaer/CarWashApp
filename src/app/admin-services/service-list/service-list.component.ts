import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ServiceService } from 'src/app/services/service.service';
import { AdminEditComponent } from '../admin-edit/admin-edit.component';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

// Define interfaces for type safety
interface ServiceType {
  serviceTypeName: string;
  serviceTypeDescription: string;
  serviceTypeImage?: string;
}

interface VehicleSize {
  vehicleSizeCode: string;
  vehicleSizeDescription: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Service {
  serviceRateID: number;
  vehicleSizeCode: string;
  service_type: ServiceType;
  price: number;
}

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  displayedServices: Service[] = [];
  filteredServices: Service[] = [];
  displayCount: number = 12; // Increased for grid layout
  currentPage: number = 1;
  totalPages: number = 1;
  
  // Search and filter properties
  searchTerm: string = '';
  selectedVehicleSize: string = '';

  // Vehicle sizes from API - THIS WAS MISSING IN YOUR COMPONENT
  vehicleSizes: VehicleSize[] = [];

  // Get unique vehicle sizes available in services
  get availableVehicleSizes(): Array<{code: string, description: string}> {
    const uniqueSizes = [...new Set(this.services.map(service => service.vehicleSizeCode))];
    return uniqueSizes.map(code => ({
      code: code,
      description: this.getVehicleSizeDescription(code)
    })).sort((a, b) => a.description.localeCompare(b.description));
  }

  constructor(
    private serviceService: ServiceService, 
    private modalController: ModalController, 
    private alertController: AlertController, 
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.loadVehicleSizes();
    this.loadServices();
  }

  // Load vehicle sizes from API - THIS WAS MISSING IN YOUR COMPONENT
  loadVehicleSizes(): void {
    this.serviceService.getVehicleSizes().subscribe({
      next: (data: VehicleSize[]) => {
        console.log('Fetched Vehicle Sizes:', data);
        this.vehicleSizes = data;
      },
      error: (err: any) => {
        console.error('Error fetching vehicle sizes:', err);
        this.presentErrorToast('Error loading vehicle sizes');
      }
    });
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (data: any[]) => {
        console.log('Fetched Services:', data);
  
        this.services = data.map((service: any) => ({
          serviceRateID: service.serviceRateID,
          vehicleSizeCode: service.vehicleSizeCode,
          service_type: service.service_type,
          price: service.price
        }));

        this.filteredServices = [...this.services];
        this.calculatePagination();
        this.updateDisplayedServices();
      },
      error: (err: any) => {
        console.error('Error fetching service rates:', err);
        this.presentErrorToast('Error loading services');
      }
    });
  }

  // Search and filter functionality
  filterServices(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.services];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter((service: Service) =>
        service.service_type.serviceTypeName.toLowerCase().includes(this.searchTerm) ||
        service.service_type.serviceTypeDescription.toLowerCase().includes(this.searchTerm) ||
        service.vehicleSizeCode.toLowerCase().includes(this.searchTerm)
      );
    }

    // Apply vehicle size filter
    if (this.selectedVehicleSize) {
      filtered = filtered.filter((service: Service) =>
        service.vehicleSizeCode === this.selectedVehicleSize
      );
    }

    this.filteredServices = filtered;
    this.currentPage = 1; // Reset to first page
    this.calculatePagination();
    this.updateDisplayedServices();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredServices.length / this.displayCount);
  }

  updateDisplayedServices(): void {
    const startIndex = (this.currentPage - 1) * this.displayCount;
    const endIndex = startIndex + this.displayCount;
    this.displayedServices = this.filteredServices.slice(startIndex, endIndex);
  }

  changePage(next: boolean): void {
    if (next && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (!next && this.currentPage > 1) {
      this.currentPage--;
    }
    this.updateDisplayedServices();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedServices();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.displayCount + 1;
    const end = Math.min(this.currentPage * this.displayCount, this.filteredServices.length);
    return `${start}-${end}`;
  }

  async openEditModal(service: Service): Promise<void> {
    console.log('Service Data:', service);

    const modal = await this.modalController.create({
      component: AdminEditComponent,
      componentProps: { service: { ...service, id: service.serviceRateID } }
    });

    modal.onDidDismiss().then((data: any) => {
      if (data.data) {
        const index = this.services.findIndex((s: Service) => s.serviceRateID === data.data.serviceRateID);
        if (index !== -1) {
          this.services[index] = data.data;
          this.applyFilters(); // Reapply filters to update display
        }
        this.presentToast('Service updated successfully ✅');
      } else {
        this.presentErrorToast('Update cancelled ❌');
      }
    });

    return await modal.present();
  }

  getImageUrl(path: string | undefined): string {
    return path || '';
  }

  // Get vehicle size description from code - THIS WAS MISSING IN YOUR COMPONENT
  getVehicleSizeDescription(code: string): string {
    const vehicleSize = this.vehicleSizes.find(size => size.vehicleSizeCode === code);
    return vehicleSize ? vehicleSize.vehicleSizeDescription : code;
  }

  async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    toast.present();
  }

  async presentErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    toast.present();
  }

  async confirmDelete(serviceId: number): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this service? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-cancel-button'
        },
        {
          text: 'Delete',
          role: 'destructive',
          cssClass: 'alert-confirm-button',
          handler: () => {
            this.deleteService(serviceId);
          },
        },
      ],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  deleteService(serviceId: number): void {
    this.serviceService.deleteService(serviceId).subscribe({
      next: () => {
        this.services = this.services.filter((s: Service) => s.serviceRateID !== serviceId);
        this.applyFilters(); // Reapply filters to update display
        console.log(`Service with ID ${serviceId} deleted successfully.`);
        this.presentToast('Service deleted successfully ✅');
      },
      error: (err: any) => {
        console.error('Error deleting service:', err);
        this.presentErrorToast('Error deleting service ❌');
      }
    });
  }
}