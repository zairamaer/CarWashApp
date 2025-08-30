import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCustomersPage } from './admin-customers.page';

describe('AdminCustomersPage', () => {
  let component: AdminCustomersPage;
  let fixture: ComponentFixture<AdminCustomersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCustomersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
