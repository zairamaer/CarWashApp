import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule} from '@ionic/angular';
import { HistoryListComponent } from './history-list/history-list.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';




@Component({
  selector: 'app-booking-history',
  templateUrl: './booking-history.page.html',
  styleUrls: ['./booking-history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HistoryListComponent, AdminSidebarComponent]
})
export class BookingHistoryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
