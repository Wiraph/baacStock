import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Reports } from '../../../../services/reports';
import { CustomerMetadata } from '../../../../services/Metadata/customer-metadata';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-report-8-shareholder-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-shareholder-register.html',
  styleUrl: './report-shareholder-register.css'
})
export class Report8ShareholderRegister implements OnInit {
  @Output() headerChange = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  // Date select options
  days: number[] = Array.from({ length: 31 }, (_, index) => index + 1);

  months: { value: number; label: string }[] = [
    { value: 1, label: 'ม.ค.' },
    { value: 2, label: 'ก.พ.' },
    { value: 3, label: 'มี.ค.' },
    { value: 4, label: 'เม.ย.' },
    { value: 5, label: 'พ.ค.' },
    { value: 6, label: 'มิ.ย.' },
    { value: 7, label: 'ก.ค.' },
    { value: 8, label: 'ส.ค.' },
    { value: 9, label: 'ก.ย.' },
    { value: 10, label: 'ต.ค.' },
    { value: 11, label: 'พ.ย.' },
    { value: 12, label: 'ธ.ค.' }
  ];
  
  years: number[] = Array.from({ length: 2568 - 2500 + 1 }, (_, index) => 2568 - index);

  // เพิ่ม property สำหรับจัดการการแสดง input fields
  selectedCustomerType: string = 'cus-type';

  // Form data properties
  selectedDay: string = '';
  selectedMonth: string = '';
  selectedYear: string = '';
  customerSearch: string = '';
  customerType: string = '';

  // Table data
  shareholders: any[] = [];
  loading: boolean = false;

  // Customer types from API
  customerTypes: any[] = [];

  // PDF display
  pdfSrc: SafeResourceUrl | null = null;
  showTable: boolean = true;

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly reportService: Reports,
    private readonly customerMetadata: CustomerMetadata,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Set default values
    const currentDate = new Date();
    this.selectedDay = currentDate.getDate().toString();
    this.selectedMonth = (currentDate.getMonth() + 1).toString();
    this.selectedYear = (currentDate.getFullYear() + 543).toString(); // Buddhist year
    
    // Load customer types from API
    this.loadCustomerTypes();
    
    setTimeout(() => this.sendHead());
  }

  sendHead() {
    this.headerChange.emit("รายงานทะเบียนผู้ถือหุ้น");
  }

  // Load customer types from API
  loadCustomerTypes() {
    this.customerMetadata.cusTypes().subscribe({
      next: (types: any[]) => {
        console.log('Customer types loaded:', types);
        this.customerTypes = types || [];
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading customer types:', err);
        // Fallback to empty array if API fails
        this.customerTypes = [];
      }
    });
  }

  onLoadCustomer() {
    this.loading = true;
    
    // Format date as YYYYMMDD
    const dateString = `${this.selectedYear}${this.selectedMonth.padStart(2, '0')}${this.selectedDay.padStart(2, '0')}`;
    
    const payload = {
      DateRep: dateString, // yyyymmdd
      CusType: this.customerType, // cuscode
      CusFname: this.selectedCustomerType === 'cusFName' ? this.customerSearch : "", // fname
      CusLname: this.selectedCustomerType === 'cusLName' ? this.customerSearch : "", // lname
      CusCardno: this.selectedCustomerType === 'cusID' ? this.customerSearch : "" // cusid
    }
    
    console.log('Search payload:', payload);
    
    this.reportService.StockHolder(payload).subscribe({
      next: (res: any) => {
        console.log('StockHolder response:', res);
        // Clear existing data first
        this.shareholders = [];
        this.cd.detectChanges();
        
        // Set new data
        this.shareholders = res || [];
        this.loading = false;
        
        // Force change detection
        this.cd.detectChanges();
        
        console.log('Shareholders updated:', this.shareholders.length, 'items');
      }, 
      error: (err) => {
        console.error('Error loading customers:', err);
        this.shareholders = [];
        this.loading = false;
        this.cd.detectChanges();
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        });
      }
    })
  }

  // Generate PDF for specific shareholder
  generatePDF(shareholder: any) {
    const dateString = `${this.selectedYear}${this.selectedMonth.padStart(2, '0')}${this.selectedDay.padStart(2, '0')}`;
    
    const payload = {
      DateRep: dateString, // YYYYMMDD
      CusCardno: shareholder.cusid, // Cusid
      TypeExport: "PDF" // PDF
    }

    console.log('PDF payload:', payload);

    this.reportService.LoadFileMenu8(payload).subscribe({
      next: (res: any) => {
        console.log('PDF response:', res);
        if (res?.fileUrl) {
          // Display PDF in iframe
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(res.fileUrl);
          this.showTable = false; // Hide table, show PDF
          this.cd.detectChanges();
        }
      }, 
      error: (err) => {
        console.error('Error generating PDF:', err);
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        })
      }
    })
  }

  // Generate EXCEL for specific shareholder
  generateEXCEL(shareholder: any) {
    const dateString = `${this.selectedYear}${this.selectedMonth.padStart(2, '0')}${this.selectedDay.padStart(2, '0')}`;
    
    const payload = {
      DateRep: dateString, // YYYYMMDD
      CusCardno: shareholder.cusid, // Cusid
      TypeExport: "EXCEL" // EXCEL
    }

    console.log('EXCEL payload:', payload);

    this.reportService.LoadFileMenu8(payload).subscribe({
      next: (res: any) => {
        console.log('EXCEL response:', res);
        if (res?.fileUrl) {
          // Download EXCEL file
          const link = document.createElement('a');
          link.href = res.fileUrl;
          link.click();
        }
      }, 
      error: (err) => {
        console.error('Error generating EXCEL:', err);
        Swal.fire({
          icon: 'error',
          text: `${err.message}`
        })
      }
    })
  }

  // เพิ่ม method สำหรับจัดการการเปลี่ยนประเภทลูกค้า
  onCustomerTypeChange(event: any): void {
    this.selectedCustomerType = event.target.value;
  }

  // Show table and hide PDF
  showTableView(): void {
    this.showTable = true;
    this.pdfSrc = null;
    this.cd.detectChanges();
  }

  goBack(): void {
    this.back.emit();
  }
}
