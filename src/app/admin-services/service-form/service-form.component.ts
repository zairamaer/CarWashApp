import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss'],
})
export class ServiceFormComponent implements OnInit {
  selectedVehicleSizes: string[] = [];
  selectedServiceTypeID: number | null = null;
  selectedFile: File | null = null;
  description: string = '';
  price: string = '';
  addedServices: any[] = [];
  serviceTypes: any[] = [];
  vehicleSizes: any[] = [];

  isAddingNewServiceType: boolean = false;
  newServiceTypeName: string = '';

  constructor(private modalCtrl: ModalController, private serviceService: ServiceService,
    private alertController: AlertController, private toastController: ToastController) {}

  ngOnInit() {
    this.fetchServiceTypes();
    this.fetchVehicleSizes(); // Fetch vehicle sizes from backend
  }

  fetchServiceTypes() {
    this.serviceService.getServiceTypes().subscribe({
      next: (data) => {
        this.serviceTypes = data;
      },
      error: (error) => {
        console.error('Error fetching service types:', error);
      },
    });
  }

  fetchVehicleSizes() {
    this.serviceService.getVehicleSizes().subscribe({
      next: (data) => {
        this.vehicleSizes = data; // Store fetched vehicle sizes
      },
      error: (error) => {
        console.error('Error fetching vehicle sizes:', error);
      },
    });
  }

  getVehicleSize(size: string): string {
    const vehicle = this.vehicleSizes.find(v => v.sizeName === size);
    return vehicle ? vehicle.vehicleSizeCode : size; // Use the backend code if found
  }

  onServiceTypeChange() {
    const selectedService = this.serviceTypes.find(type => type.serviceTypeID === this.selectedServiceTypeID);
    if (selectedService) {
      this.description = selectedService.serviceTypeDescription || ''; // Auto-fill description
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }  

  toggleNewServiceType() {
    if (this.isAddingNewServiceType) {
      this.selectedServiceTypeID = null;
      this.description = ''; // Clear description when creating a new service type
    }
  }

  saveService() {
    if (!this.price || this.selectedVehicleSizes.length === 0) {
      this.presentAlert('Missing Fields', 'Please fill all required fields.');
      return;
    }

    if (this.isAddingNewServiceType && !this.newServiceTypeName.trim()) {
      this.presentAlert('Missing Service Type', 'Please enter a new service type.');
      return;
    }

    if (this.isAddingNewServiceType) {
      this.serviceService.createServiceType({
        serviceTypeName: this.newServiceTypeName,
        serviceTypeDescription: this.description
      }).subscribe({
        next: (response) => {
          console.log('New service type created:', response);
          this.selectedServiceTypeID = response.serviceTypeID;
          this.saveServiceWithExistingType();
        },
        error: (error) => {
          console.error('Error creating new service type:', error);
          this.presentToast('Failed to create new service type ❌', 'danger');
        },
      });
    } else {
      this.saveServiceWithExistingType();
    }
  }


  saveServiceWithExistingType() {
    let completedRequests = 0;
    let failedRequests = 0;
    const totalRequests = this.selectedVehicleSizes.length;

    this.selectedVehicleSizes.forEach(size => {
      const vehicleSizeCode = this.getVehicleSize(size);

      const formData = new FormData();
      formData.append('vehicleSizeCode', vehicleSizeCode);
      formData.append('serviceTypeID', String(this.selectedServiceTypeID));
      formData.append('description', this.description);
      formData.append('price', parseFloat(this.price).toFixed(2));

      if (this.selectedFile) {
        formData.append('serviceTypeImage', this.selectedFile);
      }

      this.serviceService.createService(formData).subscribe({
        next: (response) => {
          console.log('Service created:', response);
          this.addedServices.push(response);
          completedRequests++;
          
          if (completedRequests + failedRequests === totalRequests) {
            if (failedRequests === 0) {
              this.presentToast('All services created successfully ✅');
              this.modalCtrl.dismiss(this.addedServices);
            } else if (completedRequests > 0) {
              this.presentToast(`${completedRequests} service(s) created, ${failedRequests} failed ⚠️`, 'danger');
              this.modalCtrl.dismiss(this.addedServices);
            }
          }
        },
        error: (error) => {
          console.error('Error creating service:', error);
          failedRequests++;
          
          if (completedRequests + failedRequests === totalRequests) {
            if (completedRequests === 0) {
              this.presentToast('Failed to save all services ❌', 'danger');
            } else {
              this.presentToast(`${completedRequests} service(s) created, ${failedRequests} failed ⚠️`, 'danger');
              this.modalCtrl.dismiss(this.addedServices);
            }
          }
        },
      });
    });
  }


  closeModal() {
    this.modalCtrl.dismiss();
  }

  async presentAlert(header: string, message: string) {
  const alert = await this.alertController.create({
    header,
    message,
    buttons: ['OK']
  });
  await alert.present();
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

}