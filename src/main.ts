import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { ServiceService } from './app/services/service.service';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { addIcons } from 'ionicons';
import { 
  // Existing icons
  homeOutline, 
  settingsOutline,
  logOutOutline, 
  menuOutline, 
  gridOutline,
  cogOutline, 
  chevronBackOutline, 
  chevronForwardOutline,
  calendarOutline, 
  carSportOutline, 
  arrowForwardOutline,
  personCircleOutline, 
  timeOutline, 
  fileTrayFullOutline, 
  peopleOutline,
  statsChartOutline, 
  eyeOutline, 
  close,
  person,
  
  // New icons for service forms and lists
  addOutline,
  closeOutline,
  carOutline,
  resizeOutline,
  pricetagOutline,
  createOutline,
  trashOutline,
  cloudUploadOutline,
  saveOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  closeCircleOutline,
  informationCircleOutline,
  refreshOutline,
  syncOutline,
  hourglassOutline,
  textOutline,
  cashOutline,
  documentTextOutline,
  imagesOutline,
  optionsOutline,
  arrowBackOutline,
  searchOutline,
  filterOutline,
  listOutline,
  duplicateOutline,
  downloadOutline,
  shareOutline,
  bookmarkOutline,
  warningOutline,
  shieldCheckmarkOutline,
  busOutline,
  bicycleOutline,
  waterOutline,
  sparklesOutline,

  // ✅ Needed for your template
  car,
  build
} from 'ionicons/icons';

addIcons({
  // Existing icons
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
  'person-circle-outline': personCircleOutline,
  'time-outline': timeOutline,
  'file-tray-full-outline': fileTrayFullOutline,
  'people-outline': peopleOutline,
  'stats-chart-outline': statsChartOutline,
  'eye-outline': eyeOutline,
  'close': close,
  'person': person,
  
  // New icons for enhanced forms
  'add-outline': addOutline,
  'close-outline': closeOutline,
  'car-outline': carOutline,
  'resize-outline': resizeOutline,
  'pricetag-outline': pricetagOutline,
  'create-outline': createOutline,
  'trash-outline': trashOutline,
  'cloud-upload-outline': cloudUploadOutline,
  'save-outline': saveOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'alert-circle-outline': alertCircleOutline,
  'close-circle-outline': closeCircleOutline,
  'information-circle-outline': informationCircleOutline,
  'refresh-outline': refreshOutline,
  'sync-outline': syncOutline,
  'hourglass-outline': hourglassOutline,
  'text-outline': textOutline,
  'cash-outline': cashOutline,
  'document-text-outline': documentTextOutline,
  'images-outline': imagesOutline,
  'options-outline': optionsOutline,
  'arrow-back-outline': arrowBackOutline,
  'search-outline': searchOutline,
  'filter-outline': filterOutline,
  'list-outline': listOutline,
  'duplicate-outline': duplicateOutline,
  'download-outline': downloadOutline,
  'share-outline': shareOutline,
  'bookmark-outline': bookmarkOutline,
  'warning-outline': warningOutline,
  'shield-checkmark-outline': shieldCheckmarkOutline,
  'bus-outline': busOutline,
  'bicycle-outline': bicycleOutline,
  'water-outline': waterOutline,
  'sparkles-outline': sparklesOutline,

  // ✅ Added icons
  'car': car,
  'build': build
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    ServiceService,
  ],
});
