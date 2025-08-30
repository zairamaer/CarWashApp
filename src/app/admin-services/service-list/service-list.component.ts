import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ServiceService } from 'src/app/services/service.service';
import { AdminEditComponent } from '../admin-edit/admin-edit.component';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';


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

  constructor(private serviceService: ServiceService, private modalController: ModalController, 
    private alertController: AlertController, private toastController: ToastController) {}

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
    console.log('Service Data:', service);

    const modal = await this.modalController.create({
      component: AdminEditComponent,
      componentProps: { service: { ...service, id: service.serviceRateID } }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        const index = this.services.findIndex(s => s.serviceRateID === data.data.serviceRateID);
        if (index !== -1) {
          this.services[index] = data.data;
        }
        this.updateDisplayedServices();
        this.presentToast('Service updated successfully ✅'); // 👈 Success toast
      } else {
        this.presentErrorToast('Update cancelled ❌'); // 👈 Error/Cancel toast
      }
    });

    return await modal.present();
  }


  getImageUrl(path: string): string {
    return `http://localhost:8000/storage/${path}`;
    // or use your deployed domain, e.g.
    // return `https://yourdomain.com/storage/${path}`;
  }  

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    toast.present();
  }

  async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    toast.present();
  }


  async confirmDelete(serviceId: number) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this service?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteService(serviceId);
          },
        },
      ],
    });

    await alert.present();
  }


  deleteService(serviceId: number) {
    this.serviceService.deleteService(serviceId).subscribe({
      next: () => {
        this.services = this.services.filter(s => s.serviceRateID !== serviceId);
        this.updateDisplayedServices();
        console.log(`Service with ID ${serviceId} deleted successfully.`);
        this.presentToast('Service deleted successfully'); // 👈 dito na
      },
      error: (err) => {
        console.error('Error deleting service:', err);
      }
    });
  }

}
