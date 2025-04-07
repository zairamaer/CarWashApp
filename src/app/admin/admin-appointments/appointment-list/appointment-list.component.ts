import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AppointmentListComponent  implements OnInit {

  appointments = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      serviceName: 'Car Wash',
      vehicleSize: 'M',
      price: 120,
      appointmentDate: new Date(),
      status: 'Confirmed',
      notes: 'Customer requested early morning',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      serviceName: 'Vacuum',
      vehicleSize: 'S',
      price: 50,
      appointmentDate: new Date(),
      status: 'Pending',
      notes: 'VIP Customer',
    }
  ];
  

  constructor() { }

  ngOnInit() {}

}
