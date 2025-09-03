import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size.service'; // Adjust path if needed
import { AuthService } from '../../services/auth.service'; // Add AuthService import
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class HomeHeaderComponent implements OnInit {

  constructor(
    public screenSizeService: ScreenSizeService, 
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  // Logout function
  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Logging out...',
              spinner: 'circles'
            });
            await loading.present();

            try {
              await this.authService.logout().toPromise();
              console.log('User logged out successfully');
              await loading.dismiss();
              this.router.navigate(['/login']);
            } catch (error) {
              console.error('Logout error:', error);
              await loading.dismiss();
              
              // Show error alert
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Logout failed. Please try again.',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}