import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CustomerListComponent } from './customer-list/customer-list.component';
import {AdminSidebarComponent} from 'src/app/admin/admin-sidebar/admin-sidebar.component';


@Component({
  selector: 'app-admin-customers',
  templateUrl: './admin-customers.page.html',
  styleUrls: ['./admin-customers.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CustomerListComponent, AdminSidebarComponent]
})
export class AdminCustomersPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
