import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PendingComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  pendingAppointments = [
    { service: 'Full Wash', amount: 499, dueDate: new Date(), status: 'Unpaid' },
    { service: 'Wax & Polish', amount: 799, dueDate: new Date(), status: 'Unpaid' }
  ];

}
