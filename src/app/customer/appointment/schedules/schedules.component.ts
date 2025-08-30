import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SchedulesComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  schedules = [
    { service: 'Interior Clean', date: new Date(), time: '3:00 PM', location: 'Branch A' },
    { service: 'Detailing', date: new Date(), time: '5:00 PM', location: 'Branch B' }
  ];

}
