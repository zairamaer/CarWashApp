import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HistoryComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  appointments = [
    {
      service: 'Exterior Wash',
      date: new Date(),
      time: '10:00 AM',
      vehicle: 'Toyota Vios',
      status: 'Completed'
    },
    {
      service: 'Interior Cleaning',
      date: new Date(),
      time: '02:00 PM',
      vehicle: 'Honda Civic',
      status: 'Cancelled'
    }
  ];

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  }
  

}
