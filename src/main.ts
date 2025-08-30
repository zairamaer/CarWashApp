import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http'; // Import this
import { ServiceService } from './app/services/service.service';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { addIcons } from 'ionicons';
import { homeOutline, settingsOutline, 
  logOutOutline, menuOutline, gridOutline, 
  cogOutline, chevronBackOutline, chevronForwardOutline, 
  calendarOutline, carSportOutline, arrowForwardOutline,
  personCircleOutline, timeOutline, fileTrayFullOutline, peopleOutline,
  statsChartOutline, eyeOutline, close } from 'ionicons/icons';

addIcons({
  'car-sport-outline': carSportOutline,
  'calendar-outline': calendarOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'chevron-back-outline': chevronBackOutline,
  'cog-outline': cogOutline,
  'grid-outline': gridOutline,
  'home-outline': homeOutline,
  'settings-outline': settingsOutline,
  'log-out-outline': logOutOutline,
  'menu-outline': menuOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'person-circle-outline' : personCircleOutline,
  'time-outline' : timeOutline,
  'file-tray-full-outline' : fileTrayFullOutline,
  'people-outline' : peopleOutline,
  'stats-chart-outline' : statsChartOutline,
  'eye-outline' : eyeOutline,
  'close' : close
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(), // Add this line to provide HttpClient
    ServiceService,
  ],
});
