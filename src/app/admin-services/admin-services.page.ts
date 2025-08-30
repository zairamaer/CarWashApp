import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceFormComponent } from './service-form/service-form.component';
import { AdminSidebarComponent } from '../admin/admin-sidebar/admin-sidebar.component';
import { ScreenSizeService } from '../services/screen-size.service'; // Import the service
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, IonicModule, ServiceListComponent, AdminSidebarComponent],
  templateUrl: './admin-services.page.html',
  styleUrls: ['./admin-services.page.scss'],
})
export class AdminServicesPage {
  isLargeScreen$: Observable<boolean>; // Observable to track screen size

  constructor(
    private modalController: ModalController,
    private screenSizeService: ScreenSizeService // Inject the service
  ) {
    // Subscribe to screen size changes
    this.isLargeScreen$ = this.screenSizeService.isLargeScreen$;
  }

  async openServiceForm() {
    const modal = await this.modalController.create({
      component: ServiceFormComponent,
    });
    await modal.present();
  }
}
