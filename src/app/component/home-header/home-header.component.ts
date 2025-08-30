import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size.service'; // Adjust path if needed
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class HomeHeaderComponent implements OnInit {

  constructor(public screenSizeService: ScreenSizeService, private router: Router) {}

  ngOnInit() {}


}
