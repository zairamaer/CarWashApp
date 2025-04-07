import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import {AdminSidebarComponent} from 'src/app/admin/admin-sidebar/admin-sidebar.component';
import {AppointmentListComponent} from 'src/app/admin/admin-appointments/appointment-list/appointment-list.component'

@Component({
  selector: 'app-admin-appointments',
  templateUrl: './admin-appointments.page.html',
  styleUrls: ['./admin-appointments.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, IonicModule, AppointmentListComponent]
})
export class AdminAppointmentsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  
}
