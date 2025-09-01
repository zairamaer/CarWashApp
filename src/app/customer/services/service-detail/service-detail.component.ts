import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class ServiceDetailComponent {
  @Input() service: any;

  constructor(private modalCtrl: ModalController, private router: Router) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }

  bookNow() {
    this.closeModal();
    this.router.navigate(['/booking'], {
      state: { selectedService: this.service }
    });
  }

  getImageUrl(path: string | undefined): string {
    return path || '';
  }
}
