import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HistoryComponent } from './history/history.component';
import { HomeSidebarComponent } from '../../component/home-sidebar/home-sidebar.component'; // ✅ Import Sidebar
import { HomeHeaderComponent } from '../../component/home-header/home-header.component';
import { ScreenSizeService } from '../../services/screen-size.service'; // ✅ Import this
import { PendingComponent } from './pending/pending.component';
import { SchedulesComponent } from './schedules/schedules.component';




@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HistoryComponent, HomeSidebarComponent, HomeHeaderComponent, PendingComponent, SchedulesComponent]
})
export class AppointmentPage implements OnInit {

  selectedView: 'pending' | 'scheduled' | 'history' = 'pending';

  constructor(public screenSizeService: ScreenSizeService) { }

  ngOnInit() {
  }

}
