import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerService, Customer } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class CustomerListComponent implements OnInit, OnDestroy {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  isLoading = false;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 20;
  totalItems = 0;

  // View options
  viewMode: 'grid' | 'list' = 'list';
  sortBy: 'name' | 'email' | 'createdAt' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private customerService: CustomerService,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnInit() {
    this.loadCustomers();
    
    // Subscribe to loading state
    this.customerService.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
    });

    // Subscribe to customers updates
    this.customerService.customers$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(customers => {
      this.customers = customers;
      this.filteredCustomers = [...customers];
      this.applySorting();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadCustomers() {
    try {
      const response = await this.customerService.getCustomers(this.currentPage, this.itemsPerPage).toPromise();
      if (response) {
        this.totalItems = response.total;
        this.totalPages = Math.ceil(response.total / this.itemsPerPage);
      }
    } catch (error) {
      await this.showToast('Error loading customers', 'danger');
      console.error('Error loading customers:', error);
    }
  }

  onSearchChange(event: any) {
    const searchTerm = event.target.value;
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  private performSearch(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredCustomers = [...this.customers];
    } else {
      this.filteredCustomers = this.customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }
    this.applySorting();
  }

  async presentSortOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Sort Customers',
      buttons: [
        {
          text: 'Name (A-Z)',
          handler: () => this.setSorting('name', 'asc')
        },
        {
          text: 'Name (Z-A)',
          handler: () => this.setSorting('name', 'desc')
        },
        {
          text: 'Email (A-Z)',
          handler: () => this.setSorting('email', 'asc')
        },
        {
          text: 'Email (Z-A)',
          handler: () => this.setSorting('email', 'desc')
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  setSorting(field: 'name' | 'email' | 'createdAt', order: 'asc' | 'desc') {
    this.sortBy = field;
    this.sortOrder = order;
    this.applySorting();
  }

  private applySorting() {
    this.filteredCustomers.sort((a, b) => {
      let valueA: any = a[this.sortBy];
      let valueB: any = b[this.sortBy];

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  doRefresh(event: any) {
    this.customerService.refreshCustomers();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  loadMore(event: any) {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCustomers().then(() => {
        event.target.complete();
      });
    } else {
      event.target.disabled = true;
    }
  }

  getAvatarText(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusColor(status: string = 'active'): string {
    return status === 'active' ? 'success' : 'medium';
  }

  trackByCustomerId(index: number, customer: Customer): number {
    return customer.id;
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}