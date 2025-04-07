import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ServiceService } from 'src/app/services/service.service';
import { AdminEditComponent } from '../admin-edit/admin-edit.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
})
export class ServiceListComponent implements OnInit {
  services: any[] = [];
  displayedServices: any[] = [];
  displayCount: number = 10; // Number of items per page
  currentPage: number = 1; // Track current page
  totalPages: number = 1; // Total pages

  constructor(private serviceService: ServiceService, private modalController: ModalController) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.serviceService.getServices().subscribe({
      next: (data) => {
        console.log('Fetched Services:', data); // Debugging
  
        this.services = data.map(service => ({
          serviceRateID: service.serviceRateID,  // Dapat kasama ito
          vehicleSizeCode: service.vehicleSizeCode,
          service_type: service.service_type,
          price: service.price
        }));
  
        this.totalPages = Math.ceil(this.services.length / this.displayCount);
        this.updateDisplayedServices();
      },
      error: (err) => {
        console.error('Error fetching service rates:', err);
      }
    });
  }
  
  

  updateDisplayedServices() {
    const startIndex = (this.currentPage - 1) * this.displayCount;
    const endIndex = startIndex + this.displayCount;
    this.displayedServices = this.services.slice(startIndex, endIndex);
  }

  changePage(next: boolean) {
    if (next && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (!next && this.currentPage > 1) {
      this.currentPage--;
    }
    this.updateDisplayedServices();
  }

  async openEditModal(service: any) {
    console.log('Service Data:', service); // Debugging: check if the ID is present
  
    const modal = await this.modalController.create({
      component: AdminEditComponent,
      componentProps: { service: { ...service, id: service.serviceRateID } } // Explicitly pass serviceRateID as id
    });
  
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        const index = this.services.findIndex(s => s.serviceRateID === data.data.serviceRateID);
        if (index !== -1) {
          this.services[index] = data.data;
        }
        this.updateDisplayedServices();
      }
    });
  
    return await modal.present();
  }
  
  
}
