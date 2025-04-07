import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ Import RouterModule

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule, RouterModule], // ✅ Add RouterModule
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // ✅ Allow Web Components like <ion-item>
})
export class SidebarComponent implements OnInit {

  constructor(public screenSizeService: ScreenSizeService) {}

  ngOnInit() {}

}
