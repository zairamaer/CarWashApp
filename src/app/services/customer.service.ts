import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  appointments: any[];
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'inactive';
  avatar?: string;
}

export interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Stats interface for customers
 */
export interface CustomerStats {
  totalCustomers: number;
  newCustomersThisWeek: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = environment.apiUrl; 
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  public customers$ = this.customersSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Get current user ID from localStorage
   */
  getCurrentUserId(): number | null {
    try {
      const userId = localStorage.getItem('user_id');
      return userId ? parseInt(userId, 10) : null;
    } catch (error) {
      console.warn('Error getting user_id from localStorage:', error);
      return null;
    }
  }

  /**
   * Get current user name from localStorage
   */
  getCurrentUserName(): string | null {
    try {
      return localStorage.getItem('user_name');
    } catch (error) {
      console.warn('Error getting user_name from localStorage:', error);
      return null;
    }
  }

  /**
   * Get current logged-in customer data
   */
  getCurrentCustomer(): Observable<Customer> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('No user ID found in localStorage'));
    }
    
    return this.getCustomerById(userId);
  }

  /**
   * Get current customer's appointments
   */
  getCurrentCustomerAppointments(): Observable<any[]> {
    return this.getCurrentCustomer().pipe(
      map(customer => customer.appointments || []),
      catchError(error => {
        console.error('Error fetching current customer appointments:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Set user data in localStorage (call this during login)
   */
  setCurrentUser(userId: number, userName: string): void {
    try {
      localStorage.setItem('user_id', userId.toString());
      localStorage.setItem('user_name', userName);
      console.log('User data saved to localStorage:', { userId, userName });
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  }

  /**
   * Clear user data from localStorage (call this during logout)
   */
  clearCurrentUser(): void {
    try {
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');
      this.clearCustomers(); // Also clear cached customer data
      console.log('User data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing user data from localStorage:', error);
    }
  }

  /**
   * Check if user is currently logged in
   */
  isLoggedIn(): boolean {
    return this.getCurrentUserId() !== null;
  }

  /**
   * Fetch all customers with proper response handling
   */
  getCustomers(page: number = 1, limit: number = 1000, search?: string): Observable<CustomersResponse> {
    this.loadingSubject.next(true);
    
    let params: any = {
      page: page.toString(),
      limit: limit.toString()
    };

    if (search && search.trim()) {
      params.search = search.trim();
    }

    return this.http.get<any>(`${this.apiUrl}/customers`, { params })
      .pipe(
        map(response => {
          // Handle different response formats
          if (Array.isArray(response)) {
            // Direct array response
            return {
              data: response,
              total: response.length,
              page: page,
              limit: limit
            } as CustomersResponse;
          } else if (response && response.data && Array.isArray(response.data)) {
            // Wrapped response with data property
            return {
              data: response.data,
              total: response.total || response.data.length,
              page: response.page || page,
              limit: response.limit || limit
            } as CustomersResponse;
          } else if (response && typeof response === 'object') {
            // Object response, convert to array
            return {
              data: [response],
              total: 1,
              page: page,
              limit: limit
            } as CustomersResponse;
          } else {
            // Empty or invalid response
            return {
              data: [],
              total: 0,
              page: page,
              limit: limit
            } as CustomersResponse;
          }
        }),
        tap(response => {
          this.customersSubject.next(response.data);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get customer statistics (total + new this week)
   * Optimized to fetch minimal data for stats only
   */
  getCustomerStats(): Observable<CustomerStats> {
    return this.http.get<any>(`${this.apiUrl}/customers`, {
      params: { 
        page: '1', 
        limit: '1000' // Get all customers to calculate accurate stats
      }
    }).pipe(
      map(response => {
        let customers: Customer[] = [];
        let totalCustomers = 0;

        // Handle different response formats
        if (Array.isArray(response)) {
          customers = response;
          totalCustomers = response.length;
        } else if (response && response.data && Array.isArray(response.data)) {
          customers = response.data;
          totalCustomers = response.total || response.data.length;
        } else {
          customers = [];
          totalCustomers = 0;
        }

        // Calculate new customers this week
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);

        const newCustomersThisWeek = customers.filter(customer => {
          if (!customer.createdAt) return false;
          try {
            const createdDate = new Date(customer.createdAt);
            return createdDate >= weekAgo && createdDate <= now;
          } catch (error) {
            console.warn('Invalid createdAt date for customer:', customer.id);
            return false;
          }
        }).length;

        console.log('Customer Stats Calculated:', { totalCustomers, newCustomersThisWeek });

        return { 
          totalCustomers, 
          newCustomersThisWeek 
        };
      }),
      catchError(error => {
        console.error('Failed to fetch customer stats:', error);
        // Return fallback stats
        return throwError(() => ({
          totalCustomers: 0,
          newCustomersThisWeek: 0
        }));
      })
    );
  }

  /**
   * Get a single customer by ID
   */
  getCustomerById(id: number): Observable<Customer> {
    this.loadingSubject.next(true);
    
    return this.http.get<any>(`${this.apiUrl}/customers/${id}`)
      .pipe(
        map(response => {
          // Handle wrapped response
          if (response && response.data) {
            return response.data;
          }
          return response;
        }),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Create a new customer
   */
  createCustomer(customer: Omit<Customer, 'id'>): Observable<Customer> {
    this.loadingSubject.next(true);
    
    return this.http.post<any>(`${this.apiUrl}/customers`, customer)
      .pipe(
        map(response => response.data || response),
        tap(newCustomer => {
          const currentCustomers = this.customersSubject.value;
          this.customersSubject.next([...currentCustomers, newCustomer]);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Update an existing customer
   */
  updateCustomer(id: number, updates: Partial<Customer>): Observable<Customer> {
    this.loadingSubject.next(true);
    
    return this.http.put<any>(`${this.apiUrl}/customers/${id}`, updates)
      .pipe(
        map(response => response.data || response),
        tap(updatedCustomer => {
          const currentCustomers = this.customersSubject.value;
          const index = currentCustomers.findIndex(c => c.id === id);
          if (index !== -1) {
            currentCustomers[index] = updatedCustomer;
            this.customersSubject.next([...currentCustomers]);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Delete a customer
   */
  deleteCustomer(id: number): Observable<void> {
    this.loadingSubject.next(true);
    
    return this.http.delete<void>(`${this.apiUrl}/customers/${id}`)
      .pipe(
        tap(() => {
          const currentCustomers = this.customersSubject.value;
          this.customersSubject.next(currentCustomers.filter(c => c.id !== id));
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Search customers
   */
  searchCustomers(query: string): Observable<Customer[]> {
    if (!query.trim()) {
      return this.customers$;
    }

    this.loadingSubject.next(true);
    
    return this.http.get<any>(`${this.apiUrl}/customers/search`, {
      params: { q: query.trim() }
    }).pipe(
      map(response => {
        if (Array.isArray(response)) return response;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        return [];
      }),
      tap(customers => {
        this.customersSubject.next(customers);
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get customers with appointments
   */
  getCustomersWithAppointments(): Observable<Customer[]> {
    this.loadingSubject.next(true);
    
    return this.http.get<any>(`${this.apiUrl}/customers/with-appointments`)
      .pipe(
        map(response => {
          if (Array.isArray(response)) return response;
          if (response && response.data && Array.isArray(response.data)) return response.data;
          return [];
        }),
        tap(() => {
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Refresh customers data
   */
  refreshCustomers(): void {
    this.getCustomers().subscribe();
  }

  /**
   * Get current customers value
   */
  getCurrentCustomers(): Customer[] {
    return this.customersSubject.value;
  }

  /**
   * Clear customers data
   */
  clearCustomers(): void {
    this.customersSubject.next([]);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    this.loadingSubject.next(false);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Invalid data provided';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in again';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission';
          break;
        case 404:
          errorMessage = 'Not Found: Customer not found';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('CustomerService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}