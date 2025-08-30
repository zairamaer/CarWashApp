// src/app/services/service.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'http://127.0.0.1:8000/api/service-rates'; // Replace with your actual API URL
  private vehicleSizeUrl = 'http://127.0.0.1:8000/api/vehicle-sizes';
  private serviceTypesUrl = 'http://127.0.0.1:8000/api/service-types'; 

  constructor(private http: HttpClient) {}
  
  // Get all services
  getServices(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  // Add a new service
  addService(serviceData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, serviceData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  // Update an existing service (with FormData and method override)
  updateService(serviceId: number, serviceData: FormData): Observable<any> {
    serviceData.append('_method', 'PUT'); // Laravel method spoofing
    return this.http.post<any>(`${this.apiUrl}/${serviceId}`, serviceData);
  }


  // Delete a service
  deleteService(serviceId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${serviceId}`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

    // Method to get vehicle sizes
    getVehicleSizes(): Observable<any> {
      return this.http.get<any>(this.vehicleSizeUrl);
    }

      // Method to get service types
    getServiceTypes(): Observable<any> {
      return this.http.get<any>(this.serviceTypesUrl);
    }

      // Create a new service type
  createServiceType(data: { serviceTypeName: string; serviceTypeDescription: string }): Observable<any> {
    return this.http.post<any>(this.serviceTypesUrl, data);
  }

  // Create a new service rate
  createService(data: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, data); // Let Angular auto-set headers
  }  
}
