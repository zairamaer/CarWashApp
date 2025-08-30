import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingHistoryPage } from './booking-history.page';

describe('BookingHistoryPage', () => {
  let component: BookingHistoryPage;
  let fixture: ComponentFixture<BookingHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
