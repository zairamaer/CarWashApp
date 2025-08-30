import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CustomerListComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  customers = [
    {
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      phone: '09123456789',
      totalAppointments: 5,
      lastAppointment: new Date('2024-07-10'),
    },
    {
      name: 'Maria Santos',
      email: 'maria@example.com',
      phone: '09987654321',
      totalAppointments: 3,
      lastAppointment: new Date('2024-07-15'),
    }
    // Add more customer data here
  ];
}
