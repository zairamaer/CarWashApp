import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import {AdminSidebarComponent} from 'src/app/admin/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.page.html',
  styleUrls: ['./schedules.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ScheduleListComponent, AdminSidebarComponent ]
})
export class SchedulesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
