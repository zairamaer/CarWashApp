import { Component, OnInit } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router'; // ✅ Import RouterModule

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class HeaderComponent implements OnInit {
  activeButton: string = 'home';
  private observer: IntersectionObserver | null = null;

  constructor(public screenSizeService: ScreenSizeService, private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5 // 60% of the section is visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id === 'home' || id === 'services' || id === 'pricing') {
            this.activeButton = id;
          }
        }
      });
    }, options);

    // Observe all target sections
    ['home', 'services', 'pricing'].forEach(id => {
      const section = document.getElementById(id);
      if (section) {
        this.observer?.observe(section);
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  scrollToHome() {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    this.activeButton = 'home';
  }

  scrollToServices() {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    this.activeButton = 'services';
  }

  scrollToPricing() {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    this.activeButton = 'quality'; // ID is 'pricing', but you want the activeButton to say 'quality'
  }
}
