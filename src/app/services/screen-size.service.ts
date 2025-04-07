import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // This makes it available for the entire application
})
export class ScreenSizeService {
  private isLargeScreenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isLargeScreen());
  public isLargeScreen$: Observable<boolean> = this.isLargeScreenSubject.asObservable();

  constructor() {
    // Listen to window resize events
    fromEvent(window, 'resize').pipe(
      map(() => this.isLargeScreen()) // Update screen size on resize
    ).subscribe(isLarge => this.isLargeScreenSubject.next(isLarge));
  }

  private isLargeScreen(): boolean {
    return window.innerWidth > 768; // Adjust threshold if needed
  }
}
