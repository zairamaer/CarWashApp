import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-admin-edit',
  standalone: true,
  templateUrl: './admin-edit.component.html',
  styleUrls: ['./admin-edit.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule],
})
export class AdminEditComponent implements OnInit, OnChanges {
  @Input() service: any; // Service being edited

  serviceTypes: any[] = [];
  vehicleSizes: any[] = [];
  isServiceNameEditable: boolean = false; // Flag to control edit mode
  customServiceName: string = ''; // Custom service name input

  constructor(
    private modalController: ModalController,
    private serviceService: ServiceService
  ) {}

  ngOnInit() {
    this.loadVehicleSizes();
    this.loadServiceTypes();

    if (this.service && this.service.service_type) {
      this.service.serviceTypeID = this.service.service_type.serviceTypeID;
      this.service.serviceTypeName = this.service.service_type.serviceTypeName;
      this.service.description = this.service.service_type.serviceTypeDescription;
    }
    
    this.customServiceName = this.service.serviceTypeName; // Ensure initial value
    console.log('Editing Service:', this.service);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['service'] && this.service) {
      console.log('Service changed:', this.service);
      this.updateDescription();
    }
  }

  loadVehicleSizes() {
    this.serviceService.getVehicleSizes().subscribe({
      next: (data) => {
        this.vehicleSizes = data;
      },
      error: (error) => {
        console.error('Error fetching vehicle sizes:', error);
        this.showErrorAlert('Failed to load vehicle sizes.');
      }
    });
  }

  loadServiceTypes() {
    this.serviceService.getServiceTypes().subscribe({
      next: (data) => {
        this.serviceTypes = data;

        if (this.service && this.service.serviceTypeID) {
          this.updateDescription();
        }
      },
      error: (error) => {
        console.error('Error fetching service types:', error);
        this.showErrorAlert('Failed to load service types.');
      }
    });
  }

  /**
   * Updates the service name & description when the service type changes
   */
  updateDescription() {
    if (!this.service || !this.service.serviceTypeID) return;

    const selectedType = this.serviceTypes.find(type => type.serviceTypeID === this.service.serviceTypeID);
    
    if (selectedType) {
      this.service.service_type = { 
        serviceTypeID: selectedType.serviceTypeID,
        serviceTypeName: selectedType.serviceTypeName,
        serviceTypeDescription: selectedType.serviceTypeDescription 
      };

      if (!this.isServiceNameEditable) {
        this.service.serviceTypeName = selectedType.serviceTypeName; // Update name only if not in edit mode
      }

      this.service.description = selectedType.serviceTypeDescription;
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  saveChanges() {
    if (!this.service.id) {
      console.error('Service ID is missing');
      this.showErrorAlert('Service ID is missing, unable to update.');
      return;
    }

    const updatedData = {
      vehicleSizeCode: this.service.vehicleSizeCode,
      serviceTypeID: this.service.serviceTypeID,
      price: this.service.price,
      serviceTypeDescription: this.service.description,
      serviceTypeName: this.isServiceNameEditable ? this.customServiceName : this.service.serviceTypeName
    };

    console.log('Sending to backend:', updatedData);

    this.serviceService.updateService(this.service.id, updatedData).subscribe({
      next: (updatedService) => {
        console.log('Response from backend:', updatedService);
        this.modalController.dismiss(updatedService);
      },
      error: (error) => {
        console.error('Error updating service:', error);
        this.showErrorAlert('Failed to update service.');
      }
    });
  }

  /**
   * Toggle between select and edit modes for the service name
   */
  toggleServiceNameEditMode() {
    this.isServiceNameEditable = !this.isServiceNameEditable;
    
    if (this.isServiceNameEditable) {
      this.customServiceName = this.service.serviceTypeName; // Initialize custom name input
    } else {
      this.updateDescription(); // Reset to dropdown value if exiting edit mode
    }
  }

  /**
   * Displays an error alert (if using Ionic AlertController)
   */
  private showErrorAlert(message: string) {
    alert(message);
  }
}
