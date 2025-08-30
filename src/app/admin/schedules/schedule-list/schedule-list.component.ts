import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule,]
})
export class ScheduleListComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  upcomingSchedules = [
    {
      name: 'John Doe',
      service: 'Full Wash',
      vehicle: 'SUV',
      date: new Date('2025-05-02'),
      time: '10:00 AM',
      status: 'Upcoming',
    },
    {
      name: 'Jane Smith',
      service: 'Interior Cleaning',
      vehicle: 'Sedan',
      date: new Date('2025-05-03'),
      time: '2:00 PM',
      status: 'Upcoming',
    }
  ];
  
}
