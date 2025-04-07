import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceFormComponent } from './service-form/service-form.component'; // Import Service Form
import {AdminSidebarComponent} from '../admin/admin-sidebar/admin-sidebar.component';


@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, IonicModule, ServiceListComponent, AdminSidebarComponent ],
  templateUrl: './admin-services.page.html',
  styleUrls: ['./admin-services.page.scss'],
})
export class AdminServicesPage {
  constructor(private modalController: ModalController) {}

  async openServiceForm() {
    const modal = await this.modalController.create({
      component: ServiceFormComponent,
    });
    await modal.present();
  }
}
