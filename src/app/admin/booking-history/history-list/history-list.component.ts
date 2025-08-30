import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HistoryListComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  bookingHistory = [
    {
      name: 'Carlos Reyes',
      service: 'Premium Wash',
      vehicle: 'SUV',
      date: new Date('2025-04-25'),
      time: '9:00 AM',
      total: 650,
      status: 'Completed'
    },
    {
      name: 'Angela Cruz',
      service: 'Engine Detailing',
      vehicle: 'Truck',
      date: new Date('2025-04-22'),
      time: '3:00 PM',
      total: 1200,
      status: 'Cancelled'
    }
  ];
  

}
