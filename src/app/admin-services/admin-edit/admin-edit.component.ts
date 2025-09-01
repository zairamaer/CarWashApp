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
  selectedImage: File | null = null; // Selected image for upload
  imageUrl: string | null = null;

  constructor(
    private modalController: ModalController,
    private serviceService: ServiceService
  ) {}

  ngOnInit() {
    // Load vehicle sizes and service types
    this.loadVehicleSizes();
    this.loadServiceTypes();

    // Populate service data if available
    if (this.service && this.service.service_type) {
      this.service.serviceTypeID = this.service.service_type.serviceTypeID;
      this.service.serviceTypeName = this.service.service_type.serviceTypeName;
      this.service.description = this.service.service_type.serviceTypeDescription;
      this.service.imageUrl = this.getImageUrl(this.service.service_type.serviceTypeImage);
    }

    this.customServiceName = this.service.serviceTypeName; // Ensure initial value
    console.log('Editing Service:', this.service);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Handle changes to the service input
    if (changes['service'] && this.service) {
      console.log('Service changed:', this.service);
      this.updateDescription(); // Update description when service changes
    }
  }

  // Load vehicle sizes from the service
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

  // Load service types from the service
  loadServiceTypes() {
    this.serviceService.getServiceTypes().subscribe({
      next: (data) => {
        this.serviceTypes = data;
        // Update description if service type is selected
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

  // Dismiss the modal without saving changes
  dismissModal() {
    this.modalController.dismiss();
  }

  // Save the changes to the service
  saveChanges() {
    if (!this.service.id) {
      console.error('Service ID is missing');
      this.showErrorAlert('Service ID is missing, unable to update.');
      return;
    }
  
    const formData = new FormData();
    formData.append('vehicleSizeCode', this.service.vehicleSizeCode);
    formData.append('serviceTypeID', this.service.serviceTypeID);
    formData.append('price', this.service.price);
    formData.append(
      'serviceTypeName',
      this.isServiceNameEditable ? this.customServiceName : this.service.serviceTypeName
    );
    formData.append('serviceTypeDescription', this.service.description);
  
    if (this.selectedImage) {
      formData.append('serviceTypeImage', this.selectedImage);
    }
  
    this.serviceService.updateService(this.service.id, formData).subscribe({
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

  // Function to get the image URL
  getImageUrl(path: string | undefined): string {
    return path || '';
  }

  // Handle file selection for a new image
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
  
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }  
}
