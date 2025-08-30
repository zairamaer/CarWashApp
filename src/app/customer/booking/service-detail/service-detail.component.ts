import { Component, Input, OnInit } from '@angular/core';
import { ServiceService } from '../../../services/service.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ServiceDetailComponent implements OnInit {
  @Input() service: any;
  vehicleTypes: any[] = [];
  selectedVehicleCode: string = '';
  allServices: any[] = [];
  filteredServices: any[] = [];
  selectedServices: Set<number> = new Set();
  notes: string = '';
  appointmentDate: string = '';
  appointmentTime: string = '';
  availableSlots: string[] = [];
  
  // Payment selection
  selectedPaymentMethod: string = 'paymongo';
  
  // Confirmation details
  customerName: string = '';
  referenceID: string = '';
  paymentId: number = 0;
  
  // PayMongo checkout URL
  checkoutUrl: string = '';
  
  // Payment status check
  isCheckingPayment: boolean = false;
  paymentCheckInterval: any;
  
  // Example booked slots for demonstration
  bookedSlots: Record<string, string[]> = {
    '2025-08-28': ['09:00 AM'],
    '2025-08-29': [],
  };
  
  // Define all possible slots
  allSlots: string[] = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
    '04:00 PM', '05:00 PM'
  ];
  
  // Wizard state
  steps = [
    { title: 'Vehicle Type' },
    { title: 'Services' },
    { title: 'Schedule' },
    { title: 'Payment' },
    { title: 'Confirmation' }
  ];
  
  currentStep = 1;

  constructor(
    private serviceService: ServiceService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVehicleTypes();
    this.loadServices();
    if (this.service) {
      this.selectedVehicleCode = this.service.vehicle_size.vehicleSizeCode;
      this.selectedServices.add(this.service.serviceRateID);
    }
    
    // Check for payment success/cancel from URL params
    this.route.queryParams.subscribe(params => {
      if (params['payment_success'] === 'true') {
        this.handlePaymentSuccess();
      } else if (params['payment_cancel'] === 'true') {
        this.handlePaymentCancel();
      }
    });
  }

  ngOnDestroy() {
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
    }
  }

  // Wizard navigation
  goToStep(step: number) {
    this.currentStep = step;
  }

  nextStep() {
    if (this.currentStep < this.steps.length) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // Services helpers
  getSelectedServiceIds(): number[] {
    return Array.from(this.selectedServices);
  }

  getSelectedServicesArray(): number[] {
    return Array.from(this.selectedServices);
  }

  getServiceNameById(id: number): string {
    const svc = this.allServices.find(s => s.serviceRateID === id);
    return svc ? svc.service_type.serviceTypeName : '';
  }

  calculateTotal(): number {
    return Array.from(this.selectedServices).reduce((total, id) => {
      const svc = this.allServices.find(s => s.serviceRateID === id);
      return svc ? total + Number(svc.price) : total;
    }, 0);
  }

  // Vehicle & service selection
  loadVehicleTypes() {
    this.serviceService.getVehicleSizes().subscribe((data: any[]) => {
      this.vehicleTypes = data;
      if (!this.service && data.length > 0) {
        this.selectVehicle(data[0].vehicleSizeCode);
      }
    });
  }

  loadServices() {
    this.serviceService.getServices().subscribe((data: any[]) => {
      this.allServices = data;
      this.filterServices();
    });
  }

  selectVehicle(code: string) {
    this.selectedVehicleCode = code;
    this.filterServices();
  }

  filterServices() {
    this.filteredServices = this.allServices.filter(service => service.vehicleSizeCode === this.selectedVehicleCode);
  }

  toggleService(service: any) {
    if (this.selectedServices.has(service.serviceRateID)) {
      this.selectedServices.delete(service.serviceRateID);
    } else {
      this.selectedServices.add(service.serviceRateID);
    }
  }

  isSelected(service: any): boolean {
    return this.selectedServices.has(service.serviceRateID);
  }

  // Scheduling
  fetchAvailableSlots() {
    if (!this.appointmentDate) {
      this.availableSlots = [];
      return;
    }
    const selectedDate = this.appointmentDate.split('T')[0];
    const booked = this.bookedSlots[selectedDate] || [];
    this.availableSlots = this.allSlots.filter(slot => !booked.includes(slot));
    if (!this.availableSlots.includes(this.appointmentTime)) this.appointmentTime = '';
  }

  selectTime(time: string) {
    this.appointmentTime = time;
  }

  // PayMongo payment processing
  processPayMongoPayment() {
    console.log('[DEBUG] processPayMongoPayment called');
    
    if (!this.appointmentDate || !this.appointmentTime) {
      console.log('[DEBUG] Missing date or time:', this.appointmentDate, this.appointmentTime);
      alert('Please select a date and time.');
      return;
    }
    
    if (!this.selectedServices.size) {
      console.log('[DEBUG] No services selected');
      alert('Please select a service.');
      return;
    }

    const totalAmount = this.calculateTotal();
    console.log('[DEBUG] Total amount calculated:', totalAmount);
    
    // First create the appointment
    this.createAppointmentForPayment(totalAmount);
  }

  createAppointmentForPayment(totalAmount: number) {
    console.log('[DEBUG] createAppointmentForPayment called with totalAmount:', totalAmount);
    
    const appointmentDateTime = this.formatDateTime(this.appointmentDate, this.appointmentTime);
    console.log('[DEBUG] Formatted appointmentDateTime:', appointmentDateTime);
    
    const selectedServiceId = Array.from(this.selectedServices)[0];
    const user = this.authService.getUser();
    if (!user) {
      alert('User not logged in.');
      return;
    }

    const payload = {
      customerID: user.id,
      serviceRateID: selectedServiceId,
      vehicleSizeCode: this.selectedVehicleCode,
      appointmentDateTime: appointmentDateTime,
      status: 'pending',
      notes: this.notes || ''
    };

    console.log('[DEBUG] Creating appointment payload:', payload);
    
    this.appointmentService.createAppointment(payload).subscribe({
      next: (res: any) => {
        console.log('[DEBUG] Appointment saved response:', res);
        this.referenceID = res.referenceID;
        this.createPayMongoCheckout(res.appointmentID, totalAmount);
      },
      error: (err) => {
        console.error('[DEBUG] Error saving appointment:', err);
        alert('Failed to save appointment. Please check your input.');
      }
    });
  }

  createPayMongoCheckout(appointmentId: number, amount: number) {
    console.log('[DEBUG] createPayMongoCheckout called', { appointmentId, amount });

    const serviceName = this.getServiceNameById(Array.from(this.selectedServices)[0]);
    const baseUrl = window.location.origin + window.location.pathname;

    const checkoutData = {
      appointmentID: appointmentId,
      amount: amount,
      description: `Car Wash Service - ${serviceName}`,
      success_url: `${baseUrl}?payment_success=true&appointment_id=${appointmentId}`,
      cancel_url: `${baseUrl}?payment_cancel=true&appointment_id=${appointmentId}`
    };

    console.log('[DEBUG] PayMongo checkout payload:', checkoutData);

    this.appointmentService.createPayMongoCheckout(checkoutData).subscribe({
      next: (response: any) => {
        console.log('[DEBUG] PayMongo checkout created:', response);
        if (response.success) {
          this.checkoutUrl = response.checkout_url;
          this.paymentId = response.payment_id;

          // ✅ diretso redirect
          window.location.href = this.checkoutUrl;
        } else {
          alert('Failed to create payment checkout. Please try again.');
        }
      },
      error: (err) => {
        console.error('[DEBUG] Error creating PayMongo checkout:', err);
        alert('Failed to create payment checkout. Please try again.');
      }
    });
  }


  startPaymentStatusCheck() {
    this.isCheckingPayment = true;
    console.log('[DEBUG] Starting payment status check for payment ID:', this.paymentId);
    
    this.paymentCheckInterval = setInterval(() => {
      this.appointmentService.checkPaymentStatus(this.paymentId).subscribe({
        next: (response: any) => {
          console.log('[DEBUG] Payment status check response:', response);
          if (response.status === 'paid') {
            this.handlePaymentSuccess();
          }
        },
        error: (err) => {
          console.error('[DEBUG] Error checking payment status:', err);
        }
      });
    }, 3000); // Check every 3 seconds
  }

  handlePaymentSuccess() {
    console.log('[DEBUG] Payment success detected');
    this.isCheckingPayment = false;
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
    }
    this.currentStep = this.steps.length; // jump to Confirmation step
    alert('✅ Payment successful! Your appointment is confirmed.');
  }

  handlePaymentCancel() {
    console.log('[DEBUG] Payment cancelled by user');
    this.isCheckingPayment = false;
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
    }
    alert('Payment was cancelled. You can try again.');
  }

  // Legacy GCash simulation (kept for backward compatibility)
  simulateGCashPayment() {
    console.log('[DEBUG] simulateGCashPayment called');
    if (this.selectedPaymentMethod !== 'gcash') {
      console.log('[DEBUG] Payment method is not GCash:', this.selectedPaymentMethod);
      alert('Please select GCash as payment method.');
      return;
    }
    const totalAmount = this.calculateTotal();
    console.log('[DEBUG] Total amount calculated:', totalAmount);
    const confirmed = confirm(`Simulating GCash Payment\nAmount: ₱${totalAmount}\nClick OK to confirm payment.`);
    console.log('[DEBUG] Payment confirmation result:', confirmed);
    if (confirmed) {
      this.submitAppointmentForPayment(totalAmount);
    } else {
      console.log('[DEBUG] Payment cancelled by user');
      alert('Payment cancelled.');
    }
  }

  // Legacy payment method (kept for backward compatibility)
  submitAppointmentForPayment(totalAmount: number) {
    console.log('[DEBUG] submitAppointmentForPayment called with totalAmount:', totalAmount);
    console.log('[DEBUG] Selected services:', Array.from(this.selectedServices));
    if (!this.appointmentDate || !this.appointmentTime) {
      console.log('[DEBUG] Missing date or time:', this.appointmentDate, this.appointmentTime);
      alert('Please select a date and time.');
      return;
    }
    if (!this.selectedServices.size) {
      console.log('[DEBUG] No services selected');
      alert('Please select a service.');
      return;
    }
    const appointmentDateTime = this.formatDateTime(this.appointmentDate, this.appointmentTime);
    console.log('[DEBUG] Formatted appointmentDateTime:', appointmentDateTime);
    const selectedServiceId = Array.from(this.selectedServices)[0];
    const user = this.authService.getUser();
    if (!user) {
      alert('User not logged in.');
      return;
    }
    const payload = {
      customerID: user.id,
      serviceRateID: selectedServiceId,
      vehicleSizeCode: this.selectedVehicleCode,
      appointmentDateTime: appointmentDateTime,
      status: 'pending',
      notes: this.notes || ''
    };
    console.log('[DEBUG] Creating appointment payload:', payload);
    this.appointmentService.createAppointment(payload).subscribe({
      next: (res: any) => {
        console.log('[DEBUG] Appointment saved response:', res);
        this.referenceID = res.referenceID;
        this.createPayment(res.appointmentID, totalAmount);
        this.nextStep();
      },
      error: (err) => {
        console.error('[DEBUG] Error saving appointment:', err);
        alert('Failed to save appointment. Please check your input.');
      }
    });
  }

  // Legacy payment creation (kept for backward compatibility)
  createPayment(appointmentID: number, amount: number) {
    const paymentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log('[DEBUG] createPayment called with appointmentID:', appointmentID, 'amount:', amount);
    const paymentData = {
      appointmentID: appointmentID,
      paymentDateTime: paymentDateTime,
      amount: amount,
      paymentMethod: 'GCash',
      transactionID: `TXN-${Math.floor(Math.random() * 1000000)}`,
      status: 'paid'
    };
    console.log('[DEBUG] Payment payload:', paymentData);
    this.appointmentService.createPayment(paymentData).subscribe({
      next: (res: any) => {
        console.log('[DEBUG] Payment successfully created response:', res);
        alert('Payment successful!');
      },
      error: (err) => {
        console.error('[DEBUG] Failed to create payment:', err);
        alert('Payment creation failed. Please contact support.');
      }
    });
  }

  finishBooking() {
    alert('Thank you! Your appointment is confirmed.');
    this.currentStep = 1;
    this.selectedServices.clear();
    this.appointmentDate = '';
    this.appointmentTime = '';
    this.checkoutUrl = '';
    this.paymentId = 0;
    this.referenceID = '';
  }

  // Helper: Convert 12-hour to 24-hour datetime format
  formatDateTime(date: string, time: string): string {
    if (!date || !time) return '';
    // Remove any time portion from date (keep only YYYY-MM-DD)
    const dateOnly = date.split('T')[0];
    const [hours, minutesPart] = time.split(':');
    const minutes = minutesPart.substring(0, 2);
    const period = minutesPart.slice(-2).trim();
    let h = parseInt(hours, 10);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${dateOnly} ${h.toString().padStart(2, '0')}:${minutes}:00`;
  }

  openCheckoutWindow(url: string) {
  if (url) {
    window.open(url, '_blank');
  }
}

}
