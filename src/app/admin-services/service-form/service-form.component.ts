import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';

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
  description: string = '';
  price: string = '';
  addedServices: any[] = [];
  serviceTypes: any[] = [];
  vehicleSizes: any[] = [];

  isAddingNewServiceType: boolean = false;
  newServiceTypeName: string = '';

  constructor(private modalCtrl: ModalController, private serviceService: ServiceService) {}

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

  toggleNewServiceType() {
    if (this.isAddingNewServiceType) {
      this.selectedServiceTypeID = null;
      this.description = ''; // Clear description when creating a new service type
    }
  }

  saveService() {
    if (!this.price || this.selectedVehicleSizes.length === 0) {
      alert('Please fill all required fields.');
      return;
    }

    if (this.isAddingNewServiceType && !this.newServiceTypeName.trim()) {
      alert('Please enter a new service type.');
      return;
    }

    if (this.isAddingNewServiceType) {
      this.serviceService.createServiceType({ serviceTypeName: this.newServiceTypeName, serviceTypeDescription: this.description }).subscribe({
        next: (response) => {
          console.log('New service type created:', response);
          this.selectedServiceTypeID = response.serviceTypeID;
          this.saveServiceWithExistingType();
        },
        error: (error) => {
          console.error('Error creating new service type:', error);
          alert('Failed to create new service type.');
        },
      });
    } else {
      this.saveServiceWithExistingType();
    }
  }

  saveServiceWithExistingType() {
    this.selectedVehicleSizes.forEach(size => {
      const vehicleSizeCode = this.getVehicleSize(size); // Fetch from backend

      const serviceData = {
        vehicleSizeCode: vehicleSizeCode,
        serviceTypeID: this.selectedServiceTypeID as number,
        description: this.description,
        price: parseFloat(this.price).toFixed(2),
      };

      this.serviceService.createService(serviceData).subscribe({
        next: (response) => {
          console.log('Service created:', response);
          this.addedServices.push(response);
        },
        error: (error) => {
          console.error('Error creating service:', error);
          alert('Failed to save service.');
        },
      });
    });

    this.modalCtrl.dismiss(this.addedServices);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}

